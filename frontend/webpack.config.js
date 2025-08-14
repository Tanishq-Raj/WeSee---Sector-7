const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_GAME_TOKEN_ADDRESS': JSON.stringify(process.env.REACT_APP_GAME_TOKEN_ADDRESS || ''),
      'process.env.REACT_APP_TOKEN_STORE_ADDRESS': JSON.stringify(process.env.REACT_APP_TOKEN_STORE_ADDRESS || ''),
      'process.env.REACT_APP_PLAY_GAME_ADDRESS': JSON.stringify(process.env.REACT_APP_PLAY_GAME_ADDRESS || ''),
      'process.env.REACT_APP_USDT_ADDRESS': JSON.stringify(process.env.REACT_APP_USDT_ADDRESS || '')
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    hot: true
  }
};