const webpack = require('webpack');

module.exports = {
  entry: './src/index.tsx',
  target: 'electron-renderer',
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    modules: ['node_modules', 'src'],
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
              },
            },
          },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      '__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })',
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^pg-native$/,
    }),
  ],
  devtool: 'eval-cheap-source-map',
};