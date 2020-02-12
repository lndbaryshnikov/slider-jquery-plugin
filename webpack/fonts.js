const path = require('path');

module.exports = function () {
  return {
    module: {
      rules: [
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          include: path.resolve(__dirname, '../app/src/assets/fonts'),
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
