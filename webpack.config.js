  
const webpack = require("webpack");
const path = require("path");

let config = {
  entry: {
    main: './src/chessfessor.js'
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: './chessfessor.js'
  },
  resolve: {
    fallback: {
      "os": false,
      "https": false,
      "fs": false
    }
  },

  mode: 'production'
}

module.exports = config;