module.exports = ['entry_a', 'entry_b'].map(name => ({
    entry: {
        [name]: `./test_entries/${name}.js`,
    },
    // entry: {
    //     entry_a: './test_entries/entry_a.js',
    //     entry_b: './test_entries/entry_b.js',
    // },
    optimization: {
        usedExports: true,
        sideEffects: false,
        // runtimeChunk: true,
    },
    // cache: {
    //     type: 'filesystem',
    // },
}));
