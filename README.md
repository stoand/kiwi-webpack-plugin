# Kiwi - Javascript Test Runner for Kakoune

__Warning: This tool is under development. Breaking changes make occur anytime and some
functionality might not be well tested.
Do not rely on it for anything other than experiments.__

__Supports only Webpack 4 not 5__

[![demo](https://asciinema.org/a/QiWSFNU5tKpg1oB2tslFHT4Dn.svg)](https://asciinema.org/a/QiWSFNU5tKpg1oB2tslFHT4Dn?autoplay=1)


## Getting Started Guide

(if using the `chrome` runner) A recent [Google Chrome](https://www.google.com/chrome/) browser should be installed

Version 12 or greater of [NodeJS](https://nodejs.org/en/download/) should be installed

The [Kakoune Editor](https://github.com/mawww/kakoune#2-getting-started) should be installed

Python and [Virtualenv](https://packaging.python.org/guides/installing-using-pip-and-virtual-environments/#installing-virtualenv)
should be installed (only needed for review app)

```
# A new webpack app
mkdir app1
cd app1
mkdir src
npm init

# Install the plugin and related dependencies
npm i kiwi-webpack-plugin webpack webpack-cli webpack-dev-server source-map chai
```

create `webpack.config.js`

```javascript
const KiwiPlugin = require('kiwi-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    
    // target: 'node',    // use this if using the 'node' runner
    
    // Enable source maps
    devtool: 'source-map',
    
    plugins: [
        new KiwiPlugin({
        	testEntry: './src/tests.js',
        	// Run the chrome browser instance in headless mode (in background without window)
        	headless: true,
        	// when building once (not watching) do process.exit(1)
        	// if any tests failed
        	stopBuildOnFail: true,
        	runner: 'chrome', // can also be 'node'
    	}),
    ],
}
```

create `src/index.js`

```javascript
export function someFunction() {
	return 1234;
};
```

create `src/tests.js`

```javascript
import { expect } from 'chai';
import { someFunction } from './index';

describe('Test Module', () => {
   it('test addition', () => {
       expect(1233 + 1).to.equal(someFunction());
   });
});
```

add to `package.json`

```
"scripts": {
    "start": "webpack-dev-server -w"
},
```
finally, run

```
npm start
```

and _in another shell tab_ open `src/tests.js` in Kakoune

```
kak src/tests.js
```

## Usage with Typescript 

Install types - only the "describe" and "it" jasmine-like globals are supported

```
npm i @types/jasmine @types/chai
```

add to `tsconfig.json`

```json
{
  "compilerOptions": {
  	"sourceMap": true
  	
  	...
```

## Usage with HtmlWebpackPlugin

Add `excludeChunks: ['kiwi-tests']` like so:

```js
{
    plugins: [
        new HtmlWebpackPlugin({
            title: 'App',
            excludeChunks: ['kiwi-tests'],
        }),
        new KiwiPlugin({ testEntry: './src/tests.js', headless: true }),
    ],
}

```

## Developing the library

Run `npm start`.

Run an example in the `examples` dir.

__or__ for `console.log` debugging: 

add `console.log(1)` in a source file

### Kakoune Interface Tests

Replace `kakoune_interface_tests` with the test file of choice if needed.

```
npm i; npm start
# In another shell session
npm i -g nodemon
nodemon dist/kakoune_interface_tests.js
# or
nodemon dist/unit_tests.js
```

__Using Kakoune Interface Tests:__

`edit src/kakoune_interface_tests.ts`

The test file itself is used to display interface items

### Unit Tests

```
# Build the minimal example with source maps
(cd examples/minimal && npm i && npm run build)

npm i
npm test
```
