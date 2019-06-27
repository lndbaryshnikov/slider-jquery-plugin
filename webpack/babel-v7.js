const path = require('path');

module.exports = function() {
    return {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ["@babel/preset-env"],
                            plugins: ["@babel/plugin-syntax-dynamic-import"]
                        }
                    }
                },
            ]
        },
    };
};