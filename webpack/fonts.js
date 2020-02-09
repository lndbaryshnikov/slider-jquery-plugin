const path = require("path");

module.exports = function () {
  return {
    module: {
      rules: [
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          include: path.resolve(__dirname, "../app/fonts"),
          loader: "file-loader",
          options: {
            name: "fonts/[name].[ext]",
            publicPath: "./"
          },
        }
      ]
    }
  };
};
