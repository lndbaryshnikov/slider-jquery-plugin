const path = require('path');

module.exports = function (src) {
  return {
    module: {
      rules: [
        {
          test: /\.(svg|png|ico|xml|json|webmanifest)$/,
          include: path.resolve(__dirname, src),
          loader: 'file-loader',
          options: {
            name: 'assets/favicons/[name].[ext]',
          },
        },
      ],
    },
  };
};
