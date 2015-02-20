var path = require('path');
var isProduction = process.env.NODE_ENV === 'production';
var node_modules = path.resolve(__dirname, 'node_modules');

var config = {
  entry: path.resolve(__dirname, 'demo/main.js'),
  output: {
    path: path.resolve(__dirname, 'demo'),
    filename: 'todomvc.js'
  },
  module: {
    loaders: [{
      test: /\.css$/,
      loader: 'style!css'
    }, {
      test: /\.js$/,
      loader: 'babel',
      exclude: node_modules
    }]
  }
};

module.exports = config;
