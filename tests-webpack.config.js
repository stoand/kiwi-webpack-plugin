const path = require('path');
const KiwiPlugin = require('./dist/main');

module.exports = {
    entry: './src/empty.ts',
    devtool: 'source-map',
    target: 'node',
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
            testEntry: './src/tests.ts',
            headless: true,
            stopBuildOnFail: false
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
