const test = process.env.NODE_ENV;

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const babel = require('./webpack/babel-v7');
const pug = require('./webpack/pug');
const styleExtract = require('./webpack/style.extract');
const images = require('./webpack/images');
const fonts = require('./webpack/fonts');
const devserver = require('./webpack/devserver');
const providePlugin = require('./webpack/provide-plugin');
let glob = require("glob");

const PATHS = {
    src: path.join(__dirname, 'app/src/'),
    dist: path.join(__dirname, 'dist')
};

let entry = PATHS.src + 'jquery-slider.js';
let outputPath = PATHS.dist;
let outputFilename = './js/[name].js';
let devtool = '';
let htmlFilename = 'result.html';
let htmlTemplate = PATHS.src + 'jquery-slider.pug';

if (process.env.TESTBUILD) {
    entry = glob.sync(__dirname + "/app/tests/**/*.test.js");
    outputPath = __dirname + '/tests-dist/';
    outputFilename = 'tests.js';
    devtool = 'source-map';
    htmlTemplate = __dirname + '/app/tests/tests.pug';
    htmlFilename = 'tests.html'
}


const common = merge([
    {
        entry: entry,

        output: {
            path: outputPath,
            filename: outputFilename
        },

        plugins: [
            new HtmlWebpackPlugin({
                filename: htmlFilename,
                //chunks: ['jquery-slider'],
                template: htmlTemplate,
            }),

        ],

        devtool: devtool,
    },
    babel(),
    pug(),
    styleExtract(),
    images(),
    fonts(),
    providePlugin()
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