var mockDir = require('mock-fs-require-fix');
var nodeExternals = require('../index.js');
var rollup = require('rollup').rollup;
var nodeResolve = require('rollup-plugin-node-resolve')
var commonjs = require('rollup-plugin-commonjs')
var fs = require('fs');
var ncp = require('ncp').ncp;
var path = require('path');
var relative = path.join.bind(path, __dirname);
var chai = require('chai');
var expect = chai.expect;

/**
 * Creates an assertion function that makes sure to output expectedResult when given moduleName
 * @param  {object} context          context object that holds the instance
 * @param  {string} moduleName       given module name
 * @param  {string} expectedResult   expected external module string
 * @return {function}                the assertion function
 */
exports.buildAssertion = function buildAssertion(context, moduleName, expectedResult){
    return function() {
        expect(context.instance(moduleName), expectedResult)
    };
}

/**
 * Mocks the fs module to output a desired structure
 * @param  {object} structure       the requested structure
 * @return {void}
 */
exports.mockNodeModules = function mockNodeModules(structure){
    structure = structure || {
        'moduleA' : {
            'sub-module':{},
            'another-sub':{
                'index.js' : ''
            },
        },
        'moduleB' : {
            'sub-module':{}
        },
        'moduleC' : {},
        'moduleD' : {
            'sub-module':{}
        },
        'moduleF' : {},
        '@organisation/moduleA':{},
        '@organisation/base-node':{},
    };

    mockDir({
        'node_modules' : structure,
        'package.json': JSON.stringify({
            dependencies: {
                'moduleE': '1.0.0',
                'moduleF': '1.0.0',
                '@organisation/moduleE': '1.0.0',
            },
            devDependencies: {
                'moduleG': '1.0.0',
                '@organisation/moduleG': '1.0.0',
            },            
        })
    });
}

/**
 * Restores the fs module
 * @return {void}
 */
exports.restoreMock = function restoreMock(){
    mockDir.restore();
}

exports.copyModules = function(moduleNames) {
    return Promise.all(moduleNames.map(function(moduleName) {
        return copyDir(relative('test-rollup', 'modules', moduleName), relative('../node_modules', moduleName));
    }));
}

exports.removeModules = function(moduleNames) {
    moduleNames.forEach(function(moduleName){
        removeDir(relative('../node_modules', moduleName));
    });
}

/**
 * Creates an assertion function that makes sure the result contains/doesnt contain expected modules
 * @param {object} nodeExternalsConfig The node externals configuration
 * @param {object} externals expected externals
 * @param {object} nonExternals expected non externals
 * @return {function} the assertion function
 */
exports.rollupAssertion = function rollupAssertion(nodeExternalsConfig, externals, nonExternals){
    return function() {
        return generateWithRollup(nodeExternalsConfig).then(function(result) {
            assertExternals(result, externals, nonExternals);
        }, function (err) { console.log(err) });
    };
}

/**
 * Generates the result file with rollup, using our nodeExternals
 * @param  {object} context             The context object to hang the result on
 * @param  {object} nodeExternalsConfig The node externals configuration
 * @return {Promise}
 */
function generateWithRollup(nodeExternalsConfig) {
    var testDir = relative('test-rollup');
    var outputFileName = 'bundle.js';
    var outputFile = path.join(testDir, outputFileName);
    return rollup({
        input: path.join(testDir, 'index.js'),
        external: nodeExternals(nodeExternalsConfig),
        plugins: [
            nodeResolve(),
            commonjs()
        ]
    }).then(function (bundle) {
        return bundle.generate({
            format: 'cjs'
        });
    }).then(function (output) {
        return output.code;
    });
}

function assertExternals(result , externals, nonExternals) {
    externals.forEach(function(moduleName) {
        expect(result).to.not.contain(bundled(moduleName));
        expect(result).to.contain(external(moduleName));
    });
    nonExternals.forEach(function(moduleName) {
        expect(result).to.not.contain(external(moduleName));
        expect(result).to.contain(bundled(moduleName));
    });
}

function bundled(moduleName) {
    return moduleName + ':bundled';
}

function external(moduleName) {
    return 'require(\''+ moduleName +'\')';
}

function removeDir(dirName) {
    if(fs.existsSync(dirName) ) {
      fs.readdirSync(dirName).forEach(function(file, index){
        fs.unlinkSync(path.join(dirName, file));
      });
      fs.rmdirSync(dirName);
    }
}

function copyDir(source, dest) {
    return new Promise(function(resolve, reject) {
        ncp(source, dest, function(err) {
            if(err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}