const path = require('path');

module.exports = function (src) {
  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, src),
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
  };
};
