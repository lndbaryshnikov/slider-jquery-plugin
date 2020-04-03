const autoprefixer = require('autoprefixer');
const cssMqpacker = require('css-mqpacker');
const cssnano = require('cssnano')({
  preset: [
    'default',
    {
      discardComments: {
        removeAll: true,
      },
    },
  ],
});

module.exports = {
  plugins: [autoprefixer, cssMqpacker, cssnano],
};
