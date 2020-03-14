// #SPC-webpack_plugin
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
import runner from './runner';
import './kakoune_interface';

const entryName = 'kiwi-tests';
const sourceMapOptions = {
  filename: '[file].map[query]',
  moduleFilenameTemplate: undefined,
  fallbackModuleFilenameTemplate: undefined,
  append: null,
  module: true,
  columns: true,
  lineToLine: false,
  noSources: false,
  namespace: '',
  test: /\.(m?js|css)($|\?)/i
}

export default class KiwiPlugin {
    testEntry: string;
    initRunner: Promise<any>;
    
    constructor({ testEntry, headless } : { testEntry: string, headless: boolean }) {
        if (typeof testEntry !== 'string') {
            throw 'The Kiwi plugin requires a single test entry path string to be supplied to the constructor.';
        }

        this.testEntry = testEntry;
        this.initRunner = runner(headless);
    }

    apply(compiler: any) {
        let watching = false;

        compiler.hooks.watchRun.tap("KiwiPlugin", () => {
            watching = true;
        });
        
        // Get the entry context from a entryOption hook
        compiler.hooks.entryOption.tap("KiwiPlugin", (context: any, _entry: any) => {
            // Apply the SingleEntryPlugin to add our tests file to the entries
            new SingleEntryPlugin(context, this.testEntry, entryName).apply(compiler);
        });
       
        compiler.hooks.compilation.tap("KiwiPlugin", (compilation: any) => {
            // get the compilation object
			compilation.hooks.afterOptimizeChunkAssets.tap("KiwiPlugin", () => {
    			// wait for afterOptimizeChunkAssets because sourcemaps are already generated at this step
                let testsAsset = compilation.assets[entryName + '.js'];
                if (testsAsset) {
                    let { source, map } = testsAsset.sourceAndMap(sourceMapOptions);
                    this.initRunner.then(async runner => {
                    	let results = await runner(source, map, !watching);
                    	console.log(results);
                	});
                }
			});
        });
    }
}
