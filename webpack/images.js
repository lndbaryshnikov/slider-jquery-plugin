const path = require('path');

module.exports = function ({ src, exclude }) {
  return {
    module: {
      rules: [
        {
          test: /\.(jpe?g|png|svg)$/,
          include: path.resolve(__dirname, src),
          exclude: exclude.map((relativePath) => path.resolve(__dirname, relativePath)),
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'assets/images/[name].[ext]',
              },
            },
          ],
        },
      ],
    },
  };
};
