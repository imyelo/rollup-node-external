var nodeExternals = require('../index.js');
var testUtils = require('./test-utils.js');
var rollupAssertion = testUtils.rollupAssertion

// Test actual rollup output
describe('actual rollup bundling', function() {

    before(function() {
        return testUtils.copyModules(['module-a', 'module-b']);
    });
// 
    describe('basic tests', function() {
        it('should output modules without bundling', rollupAssertion({}, ['module-a', 'module-b'], []));
        it('should honor a whitelist', rollupAssertion({ whitelist: ['module-a'] }, ['module-b'], ['module-a']));
    });

    after(function() {
        testUtils.removeModules(['module-a', 'module-b']);
    });
});