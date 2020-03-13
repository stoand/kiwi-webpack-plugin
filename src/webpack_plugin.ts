// #SPC-webpack_plugin
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
import runner from './runner';
import './kakoune_interface';

const entryName = 'kiwi-tests';

export default class KiwiPlugin {
    testEntry: string;
    
    constructor(testEntry: string) {
        if (typeof testEntry !== 'string') {
            throw 'The Kiwi plugin requires a single test entry path string to be supplied to the constructor.';
        }

        this.testEntry = testEntry;
    }

    apply(compiler: any) {
        // Get the entry context from a entryOption hook
        compiler.hooks.entryOption.tap("KiwiPlugin", (context: any, _entry: any) => {
            // Apply the SingleEntryPlugin to add our tests file to the entries
            new SingleEntryPlugin(context, this.testEntry, entryName).apply(compiler);
        });

        // When our compiled tests our outputted we run them
        compiler.hooks.assetEmitted.tap("KiwiPlugin", (file: string, content: Buffer) => {
            if (entryName + '.js' === file) {
                runner(content.toString());
            }
        });
    }
}
