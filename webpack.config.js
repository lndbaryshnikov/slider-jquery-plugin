const test = process.env.NODE_ENV;

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const babel = require('./webpack/babel');
const pug = require('./webpack/pug');
const styleExtract = require('./webpack/style.extract');
const images = require('./webpack/images');
const fonts = require('./webpack/fonts');
const devserver = require('./webpack/devserver');
const providePlugin = require('./webpack/provide-plugin');
const typescript = require('./webpack/typescript');

const PATHS = {
    src: path.join(__dirname, 'app/src/'),
    dist: path.join(__dirname, 'dist')
};

const common = merge([
    {
        entry: PATHS.src + 'jquery-slider.ts',

        output: {
            path: PATHS.dist,
            filename: './js/index.js'
        },

        externals: {
            jquery: 'jQuery'
        },

        devtool: 'source-map',
    },
    babel(),
    styleExtract(),
    images(),
    fonts(),
    providePlugin(),
    typescript()
]);


module.exports = function(env){
    if (env === 'production') {
        return common;
    }
    if (env === 'development') {
        return merge([
            {},
            common,
            devserver()
        ]);
    }
};