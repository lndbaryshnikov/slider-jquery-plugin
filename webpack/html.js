const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (templateSrc) {
  return {
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        chunks: ['index'],
        template: path.resolve(__dirname, templateSrc),
      }),
    ],
  };
};
