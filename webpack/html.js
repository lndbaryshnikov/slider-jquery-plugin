const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (src) {
  return {
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        chunks: ['jquery-slider-demo'],
        template: `${src}/pages/slider-demo/slider-demo.pug`,
      }),
    ],
  };
};
