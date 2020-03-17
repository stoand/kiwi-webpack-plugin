# Kiwi - Test Runner for Kakoune

# WARNING - this tool is in the experimental phase

__Do not rely on it for anything other than experiments.__


## Using the Library

You need a recent [Google Chrome](https://www.google.com/chrome/) browser installed.

```
npm i kiwi-webpack-plugin source-map chai

# Typescript types
# only describe and it are supported
npm i @types/mocha @types/chai
```

add to webpack config:

```javascript
{
    plugins: [
        new KiwiPlugin({
        	testEntry: './src/tests.js',
        	// Run the chrome browser instance in headless mode (in background without window)
        	headless: true,
        	// when building once (not watching) do process.exit(1)
        	// if any tests failed
        	stopBuildOnFail: true,
    	}),
    ],
}

```

Create `src/tests.js`

```javascript
import { expect } from 'chai';

describe('Test Module', () => {
   it('test addition', () => {
       expect(1+1).to.equal(2);
   });
});

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

### Testing

Replace `kakoune_interface_tests` with the test file of choice if needed.

```
npm i; npm start
# In another shell session
nodemon dist/kakoune_interface_tests.js
```
