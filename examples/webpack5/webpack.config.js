const KiwiPlugin = require('kiwi-webpack-plugin');

module.exports = {
    entry: './src/app.js',
    devtool: 'source-map',
    target: 'node',
    plugins: [
        new KiwiPlugin({
            testEntry: './src/test.js',
            stopBuildOnFail: false,
            runner: 'node',
        }),
    ],
};
