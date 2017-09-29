rollup node modules external
==============================
> Easily exclude node modules in rollup, forked from webpack-node-externals

[![Version](https://img.shields.io/npm/v/@yelo/rollup-node-external.svg)](https://www.npmjs.org/package/@yelo/rollup-node-external)
[![Downloads](https://img.shields.io/npm/dm/@yelo/rollup-node-external.svg)](https://www.npmjs.org/package/@yelo/rollup-node-external)

rollup allows you to define [*external*](https://rollupjs.org/#peer-dependencies) - modules that should not be bundled.

When bundling with rollup for the backend - you usually don't want to bundle its `node_modules` dependencies.
This library creates an *external* function that ignores `node_modules` when bundling in rollup.

**Forked from [liady/webpack-node-externals](https://github.com/liady/webpack-node-externals)**

## Quick usage
```sh
npm install @yelo/rollup-node-external --save-dev
```

In your `rollup.config.js`:
```js
var external = require('@yelo/rollup-node-external');
...
module.exports = {
    ...
    external: external(), // in order to ignore all modules in node_modules folder
    plugins: [
        ...
        // import node-resolve plugin
        require('rollup-plugin-node-resovle')(),
        ...
    ],
    ...
};
```
And that's it. All node modules will no longer be bundled but will be left as `require('module')`.

## Detailed overview
### Description
This library scans the `node_modules` folder for all node_modules names, and builds an *external* function that tells rollup not to bundle those modules, or any sub-modules of theirs.

### Configuration
This library accepts an `options` object.

#### `options.whitelist (=[])`
An array for the `external` to whitelist, so they **will** be included in the bundle. Can accept exact strings (`'module_name'`), regex patterns (`/^module_name/`), or a function that accepts the module name and returns whether it should be included.
<br/>**Important** - if you have set aliases in your rollup config with the exact same names as modules in *node_modules*, you need to whitelist them so rollup will know they should be bundled.

#### `options.importType (='commonjs')`
The method in which unbundled modules will be required in the code. Best to leave as `commonjs` for node modules.

#### `options.modulesDir (='node_modules')`
The folder in which to search for the node modules.

#### `options.modulesFromFile (=false)`
Read the modules from the `package.json` file instead of the `node_modules` folder.

#### Example
```js
var external = require('@yelo/rollup-node-external');
...
module.exports = {
    ...
    external: external({
        // this WILL include `jquery` in the bundle, as well as `lodash/*`
        whitelist: ['jquery', /^lodash/]
    }),
    plugins: [
        ...
        require('rollup-plugin-node-resovle')(),
        ...
    ],
    ...
};
```
    
For most use cases, the defaults of `importType` and `modulesDir` should be used.

### Test
```sh
npm run test
```

## License
MIT
