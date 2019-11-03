module.exports = {
    "roots": [
        "<rootDir>/app/tests"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.jsx?$": "babel-jest"
    },
    "testRegex": "\\.test\\.[jt]sx?$",
    "setupFiles": ["<rootDir>/setup-jest"],
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"],
};
