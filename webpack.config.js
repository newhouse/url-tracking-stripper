'use strict';

const path      = require('path');
const _         = require('lodash');
const webpack   = require('webpack');


// BASE VERSION OF THE CONFIG. DOES NOT UGLIFY
const base = {

  context: path.resolve(__dirname, './assets'),

  entry: {
    background:       './js/background.js',
    options:          './js/options.js',
    info:             './js/info.js',
    welcome:          './js/welcome.js'
  },

  output: {
    path: path.resolve(__dirname, './chrome/public/js'),
    filename: '[name].js',
  },

  resolve: {
    extensions: ['.js']
  },


  plugins: [],

  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [path.resolve(__dirname, './assets')],
        exclude: [
          path.resolve(__dirname, './node_modules'),
          path.resolve(__dirname, './chrome/public')
        ],
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      }
    ]
  }
};


// CLONE THE BASE
const uglified = _.cloneDeep(base);

// ...AND ADD UGLIFY PLUGIN
uglified.plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    compress: true
  })
);

module.exports = {
  uglified: uglified,
  debug:    base
};