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

## Developing the library

Run `npm start`.

Run an example in the `examples` dir.