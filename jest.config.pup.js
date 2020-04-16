const config = require('./jest.config');

config.testRegex = '\\.test\\.pup\\.[jt]sx?$';

console.log('RUNNING JEST-PUPPETEER TESTS (VIEW TESTS REQUIRING BROWSER API)');

module.exports = config;
