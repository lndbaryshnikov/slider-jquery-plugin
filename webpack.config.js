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
let glob = require("glob");

const PATHS = {
    src: path.join(__dirname, 'app/src/'),
    dist: path.join(__dirname, 'dist')
};

let entry = PATHS.src + 'jquery-slider.ts';
let outputPath = PATHS.dist;
let outputFilename = './js/index.js';

if (process.env.TESTBUILD) {
    entry = glob.sync(__dirname + "/app/dom-tests/**/*.test.ts");
    outputPath = __dirname + '/dom-tests-dist/';
    outputFilename = 'tests.js';
}


const common = merge([
    {
        entry: entry,

        output: {
            path: outputPath,
            filename: outputFilename
        },

        externals: {
            jquery: 'jQuery'
        },

        devtool: 'source-map',
        //For jsdom when I tried to run dom-tests om Node.js
        // node: {
        //     net: 'empty',
        //     tls: 'empty',
        //     dns: 'empty',
        //     fs: 'empty',
        //     child_process: 'empty'
        // }
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