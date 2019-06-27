const path = require('path');

module.exports = function() {
    return {
        devServer: {
            stats: 'errors-only'
        }
    };
};