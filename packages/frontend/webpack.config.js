const { DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
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
    ],
  },
  plugins: [
    new DefinePlugin({
      '__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })',
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  ],
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
