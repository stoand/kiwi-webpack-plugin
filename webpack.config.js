const path = require('path');

module.exports = {
    entry: './src/plugin.ts',
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
