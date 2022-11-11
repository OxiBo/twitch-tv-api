const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const config = {
  mode: 'development',
  entry: {
    index: path.resolve(__dirname, 'src/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 3030,
    open: true,
    hot: false,
    liveReload: true,
    compress: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      title: 'Webpack 5 App',
      filename: 'index.html',
      template: 'src/index.html',
    }),
    new Dotenv({
      path: './.env',
      safe: true,
    }),
  ],
};

module.exports = (env, options) => {
  // depending on the mode (production or development build config object and set devtool to see which part(file) has an error more accurately)
  let isProd = options.mode === 'production';

  config.devtool = isProd ? false : 'eval-cheap-module-source-map'; // "eval-source-map" - slowest, "eval-cheap-module-source-map" is slow but shows correct lines of code; 'eval-sourcemap'; // it is possible instead of false write 'source-map' but it this case the code will be accessible in console.
  // console.log(options)

  //config.target = isProd ? 'browser-list' : 'web';
  return config;
};
