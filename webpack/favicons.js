const path = require('path');

module.exports = function () {
  return {
    module: {
      rules: [
        {
          test: /\.(svg|png|ico|xml|json|webmanifest)$/,
          include: path.resolve(__dirname, '../app/src/assets/favicons'),
          loader: 'file-loader',
          options: {
            name: 'assets/favicons/[name].[ext]',
          },
        },
      ],
    },
  };
};
