const path = require('path');

module.exports = function () {
  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, '../app'),
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
