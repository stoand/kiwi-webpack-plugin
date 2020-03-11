const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const KiwiPlugin = require('kiwi-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map', 
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
      new HtmlWebpackPlugin({
          title: 'Kiwi - Sample Bank App',
          excludeChunks: ['kiwi-tests'],
      }),
      new KiwiPlugin('./src/tests.ts'),
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
};
