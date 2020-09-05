const path = require('path');

module.exports = function (src) {
  return {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: path.resolve(__dirname, src),
          use: 'ts-loader',
        },
      ],
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
  };
};
