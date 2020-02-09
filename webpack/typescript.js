const path = require("path");

module.exports = function () {
  return {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: path.resolve(__dirname, "../app"),
          use: "ts-loader"
        },
      ]
    },

    resolve: {
      extensions: [".tsx", ".ts", ".js"]
    },
  };
};
