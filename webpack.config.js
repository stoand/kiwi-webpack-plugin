const path = require('path');

module.exports = {
    entry: {
        main: './src/webpack_plugin.ts',
        kakoune_interface_tests: './src/kakoune_interface_tests.ts',
        runner_tests: './src/runner_tests.ts',
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.raw.js$/,
                use: 'raw-loader',
            },
        ],
    },
    node: {
        __dirname: true,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        libraryExport: 'default',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'dist'),
    },
}
