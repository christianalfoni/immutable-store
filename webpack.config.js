var path = require('path');
var isProduction = process.env.NODE_ENV === 'production';

var config = {
  entry: path.resolve(__dirname, 'src/Store.js'),
  output: {
    path: path.resolve(__dirname, isProduction ? 'dist' : 'build'),
    libraryTarget: 'umd',
    library: 'Store',
    filename: 'immutable-store.js'
  },
  module: {
    preLoaders: [{
      test: /\.js$/,
      loader: 'jshint'
    }]
  },
  jshint: {
    globalstrict: true,
    newcap: false,
    proto: true
  }
};

module.exports = config;
