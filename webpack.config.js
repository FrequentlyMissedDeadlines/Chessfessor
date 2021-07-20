  
const webpack = require("webpack");
const path = require("path");

let config = {
  plugins: [
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
    }),
  ],
  entry: {
    main: './src/chessfessor.js'
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: './chessfessor.js'
  },
  
  target: 'node',
  mode: 'production'
}

module.exports = config;