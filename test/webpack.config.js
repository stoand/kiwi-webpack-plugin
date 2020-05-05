const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const KiwiPlugin = require('kiwi-webpack-plugin');

module.exports = {
    entry: './empty.ts',
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
        new KiwiPlugin({
            testEntry: './t1.ts',
            headless: true,
            stopBuildOnFail: true
        }),
    ],
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
