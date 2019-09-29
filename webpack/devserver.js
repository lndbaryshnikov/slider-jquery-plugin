const path = require('path');

module.exports = function() {
    return {
        devServer: {
            stats: 'optionsErrors-only'
        }
    };
};