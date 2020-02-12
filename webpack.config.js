const path = require('path');
const merge = require('webpack-merge');

const babel = require('./webpack/babel');
const pug = require('./webpack/pug');
const html = require('./webpack/html');
const styles = require('./webpack/styles');
const images = require('./webpack/images');
const fonts = require('./webpack/fonts');
const devserver = require('./webpack/devserver');
const provideJQuery = require('./webpack/provide-jquery');
const typescript = require('./webpack/typescript');
const favicons = require('./webpack/favicons');
const minimizer = require('./webpack/minimizer');

const PATHS = {
  src: path.join(__dirname, 'app/src'),
  dist: path.join(__dirname, 'dist'),
};

const common = merge([
  {
    entry: {
      'jquery-slider': `${PATHS.src}/components/jquery-slider.ts`,
      'jquery-slider-demo': `${PATHS.src}/slider-demo/slider-demo.ts`,
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
  html(PATHS.src),
  babel(),
  pug(),
  styles(),
  images(),
  fonts(),
  provideJQuery(),
  typescript(),
  favicons('./app/src/images/favicon.png'),
]);


module.exports = function (env) {
  if (env === 'production') {
    return common;
  }
  if (env === 'development') {
    return merge([
      {},
      common,
      devserver(),
    ]);
  }
};
