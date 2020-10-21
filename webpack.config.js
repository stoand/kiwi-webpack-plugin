const path = require('path');

module.exports = {
    entry: {
        main: './src/webpack_plugin.ts',
        kakoune_interface_tests: './src/kakoune_interface_tests.ts',
        unit_tests: './src/unit_tests.ts',
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
    externals: [
        'source-map',
    ],
    output: {
        libraryExport: 'default',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'dist'),
    },
}
