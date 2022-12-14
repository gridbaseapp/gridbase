const path = require('path');
const dotenv = require('dotenv');
const { ExternalsPlugin, IgnorePlugin, DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (_, { mode }) => {
  dotenv.config({ path: `.env.${mode}` });

  return {
    entry: './src/renderer/index.tsx',
    output: {
      path: path.resolve(__dirname, 'build/src/renderer'),
    },
    target: 'electron-renderer',
    resolve: {
      extensions: ['.js', '.ts', '.tsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/i,
          use: [
            { loader: 'style-loader' },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  exportLocalsConvention: 'camelCaseOnly',
                  localIdentName: '[path][name]__[local]',
                },
              },
            },
            { loader: 'sass-loader' },
          ],
        },
        {
          test: /\.css$/i,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' },
          ],
        },
      ],
    },
    plugins: [
      new DefinePlugin({
        '__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })',
        'SPLASH_TIMEOUT': `'${process.env.SPLASH_TIMEOUT}'`,
        'RELEASE_API_URL': `'${process.env.RELEASE_API_URL}'`,
      }),
      new IgnorePlugin({
        resourceRegExp: /^pg-native$/,
      }),
      new ExternalsPlugin('commonjs', ['keytar']),
      new HtmlWebpackPlugin({
        template: 'src/renderer/index.html',
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/main', to: '../main' },
        ],
      }),
    ],
    devtool: 'eval-cheap-source-map',
    devServer: {
      client: {
        overlay: false,
      },
    },
  };
};
