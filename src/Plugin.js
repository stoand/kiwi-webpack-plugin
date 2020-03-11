const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

const entryName = 'kiwi-tests';

class KiwiPlugin {
	constructor(options) {
    	this.testEntry = options;
	}

	apply(compiler) {
    	// Get the entry context from a entryOption hook
		compiler.hooks.entryOption.tap("KiwiPlugin", (context, _entry) => {
    		console.log(context);
    		// Apply the SingleEntryPlugin to add our tests file to the entries
    		new SingleEntryPlugin(context, this.testEntry, entryName).apply(compiler);
		});
	}
}

module.exports = KiwiPlugin;
