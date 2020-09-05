const path = require('path');

module.exports = function (src) {
  return {
    module: {
      rules: [
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          include: path.resolve(__dirname, src),
          loader: 'file-loader',
          options: {
            name: 'assets/fonts/[name].[ext]',
            publicPath: './',
          },
        },
      ],
    },
  };
};
