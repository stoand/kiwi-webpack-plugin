const path = require('path');

module.exports = {
    entry: './src/webpack_plugin.ts',
    target: 'node',
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        libraryExport: 'default',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'dist'),
    },
}
