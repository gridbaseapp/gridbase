const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (_, { mode }) => {
  const isProduction = mode === "production";

  const plugins = [
    new DefinePlugin({
      '__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })',
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  ]

  if (isProduction) {
    plugins.push(new MiniCssExtractPlugin());
  }

  return {
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
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
            isProduction ? MiniCssExtractPlugin.loader : { loader: 'style-loader' },
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
      ],
    },
    plugins,
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: false,
            }
          },
        }),
      ],
    },
    devtool: false,
    devServer: {
      client: {
        overlay: false,
      },
    },
  };
};
