const config = require('./jest.config');

config.testRegex = '\\.test\\.pup\\.[jt]sx?$';

console.log(`
RUNNING JEST-PUPPETEER TESTS (VIEW TESTS REQUIRING BROWSER API)
The plugin must be bundled before running these tests!
`);

module.exports = config;
