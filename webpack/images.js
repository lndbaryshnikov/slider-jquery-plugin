const path = require('path');

module.exports = function () {
  return {
    module: {
      rules: [
        {
          test: /\.(jpg|png|svg)$/,
          include: path.resolve(__dirname, '../app/src'),
          exclude: [
            path.resolve(__dirname, '../app/src/assets/fonts'),
            path.resolve(__dirname, '../app/src/assets/favicons'),
          ],
          loader: 'file-loader',
          options: {
            name: 'assets/images/[name].[ext]',
          },
        },
      ],
    },
  };
};
