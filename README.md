# Kiwi - Test Runner for Kakoune

## Using the Library

```
npm i kiwi-webpack-plugin chai

# Typescript types
npm i @types/mocha @types/chai
```

add to webpack config:

```javascript
{
    plugins: [
        new KiwiPlugin('./src/tests.js'),
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
        new KiwiPlugin('./src/tests.js'),
    ],
}

```

## Customization Options

Add to your `~/.config/kak/kakrc`:

```
declare-option str kiwi_color_normal_notification
set-option global kiwi_color_normal_notification "Default"

declare-option str kiwi_color_error_notification
set-option global kiwi_color_error_notification "Error"

declare-option str kiwi_color_uncovered
set-option global kiwi_color_uncovered "gray"

declare-option str kiwi_color_fail
set-option global kiwi_color_fail "yellow"

declare-option str kiwi_color_success
set-option global kiwi_color_success "green"

declare-option str kiwi_status_chars
set-option global kiwi_status_chars "••"
```

## Developing the library

Run `npm start`.

Run an example in the `examples` dir.

__or__ for `console.log` debugging: 

add `console.log(1)` in a source file

### Testing

Replace`kakoune_interface_tests` with the test file of choice if needed.

```
npm i; npm start
# In another shell session
nodemon dist/kakoune_interface_tests.js
```
