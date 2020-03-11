const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const path = require('path');


const entryName = 'kiwi-tests';

function runTests(compiledSrc) {
    console.log('todo run tests', compiledSrc);
}

class KiwiPlugin {
	constructor(testEntry) {
    	if (typeof testEntry !== 'string') {
        	throw 'the Kiwi plugin requires a single test entry path string to be supplied to the constructor.';
    	}
    	
    	this.testEntry = testEntry;
	}

	apply(compiler) {
    	// Get the entry context from a entryOption hook
		compiler.hooks.entryOption.tap("KiwiPlugin", (context, _entry) => {
    		// Apply the SingleEntryPlugin to add our tests file to the entries
    		new SingleEntryPlugin(context, this.testEntry, entryName).apply(compiler);
		});

	    // When our compiled tests our outputted we run them
		compiler.hooks.assetEmitted.tap("KiwiPlugin", (file, content) => {
    		if (entryName + '.js' === file) {
        		runTests(content.toString());
    		}
		});
	}
}

module.exports = KiwiPlugin;
