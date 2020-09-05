const path = require('path');

const merge = require('webpack-merge');

const babel = require('./webpack/babel');
const pug = require('./webpack/pug');
const html = require('./webpack/html');
const styles = require('./webpack/styles');
const images = require('./webpack/images');
const fonts = require('./webpack/fonts');
const devserver = require('./webpack/devserver');
const jqueryProvider = require('./webpack/jquery-provider');
const typescript = require('./webpack/typescript');
const favicons = require('./webpack/favicons');
const minimizer = require('./webpack/minimizer');

const PATHS = {
  src: path.join(__dirname, 'src'),
  dist: path.join(__dirname, 'dist'),
};

const commonSet = merge([
  {
    entry: {
      index: `${PATHS.src}/demo-page/demo-page.ts`,
      'jquery-slider-plugin': `${PATHS.src}/plugin/main.ts`,
    },

    output: {
      path: PATHS.dist,
      filename: './js/[name].js',
    },

    externals: {
      jquery: 'jQuery',
    },

    devtool: 'source-map',
  },
  minimizer(),
  babel('../src'),
  typescript('../src'),
  pug(),
  styles(),
  html('../src/demo-page/demo-page.pug'),
  images({
    src: '../src',
    exclude: [
      '../src/demo-page/assets/fonts',
      '../src/demo-page/assets/favicons',
    ],
  }),
  fonts('../src/assets/fonts'),
  jqueryProvider(),
  favicons('../src/demo-page/assets/favicons'),
]);

module.exports = function (env) {
  if (env === 'production') {
    return commonSet;
  }
  if (env === 'development') {
    return merge([{}, commonSet, devserver()]);
  }
};
