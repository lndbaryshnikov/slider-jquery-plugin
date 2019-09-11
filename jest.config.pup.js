const config = require('./jest.config');

config.testRegex = "\\.test\\.pup\\.[jt]sx?$" ;

console.log('RUNNING JEST-PUPPETEER TESTS');

module.exports = config;