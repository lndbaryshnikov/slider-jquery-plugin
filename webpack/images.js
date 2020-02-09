const path = require("path");

module.exports = function () {
  return {
    module: {
      rules: [
        {
          test: /\.(jpg|png|svg)$/,
          exclude: path.resolve(__dirname, "../app/fonts"),
          loader: "file-loader",
          options: {
            name: "images/[name].[ext]"
          },
        }
      ]
    }
  };
};
