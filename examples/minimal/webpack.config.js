const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const KiwiPlugin = require('kiwi-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Kiwi - Sample Bank App',
            excludeChunks: ['kiwi-tests'],
        }),
        new KiwiPlugin({
            testEntry: './src/tests.ts',
            stopBuildOnFail: false,
            runner: 'node',
        }),
    ],
    target: 'node',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devServer: {
        host: '0.0.0.0'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
    },
};
