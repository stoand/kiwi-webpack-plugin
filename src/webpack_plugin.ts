// #SPC-webpack_plugin
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
import { startReviewApp, updateReviewAppDataSource } from './review_app_interface';
import launchInstance, { InitRunner, emptyRunResult } from './runner';
import handleTestRun from './actions';

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

type PluginOptions = { testEntry: string, headless?: boolean, stopBuildOnFail?: boolean, runner?: 'node' | 'chrome' };

export default class KiwiPlugin {

    stopBuildOnFail: boolean;
    testEntry: string;
    initRunner: InitRunner;

    constructor({ testEntry, headless, stopBuildOnFail, runner }: PluginOptions) {
        if (typeof testEntry !== 'string') {
            throw 'The Kiwi plugin requires a single test entry path string to be supplied to the constructor.';
        }

        this.testEntry = testEntry;
        this.initRunner = launchInstance(headless, runner);
        this.stopBuildOnFail = stopBuildOnFail || false;
    }

    apply(compiler: any) {
        let watching = false;
        let alreadyRun = false;

        compiler.hooks.watchRun.tap("KiwiPlugin", () => {
            if (!watching) {
                // startReviewApp();
            }

            watching = true;
            alreadyRun = false;

        });

        // Get the entry context from a entryOption hook
        compiler.hooks.entryOption.tap("KiwiPlugin", (context: any, _entry: any) => {
            // Apply the SingleEntryPlugin to add our tests file to the entries
            new SingleEntryPlugin(context, this.testEntry, entryName).apply(compiler);
        });

        compiler.hooks.compilation.tap("KiwiPlugin", (compilation: any) => {
            // get the compilation object
            compilation.hooks.afterOptimizeChunkAssets.tap("KiwiPlugin", () => {
                let failed = compilation.entries.some((entry: any) => entry.errors.length > 0);

                // #SPC-runner.errors_build
                if (failed && watching && !alreadyRun) {
                    alreadyRun = true;
                    // remove notifications and statuses if compilation failed
                    handleTestRun(emptyRunResult);
                } else if (!failed) {
                    // wait for afterOptimizeChunkAssets because sourcemaps are already generated at this step
                    let testsAsset = compilation.assets[entryName + '.js'];
                    if (testsAsset && !alreadyRun) {
                        alreadyRun = true;
                        let { source, map } = testsAsset.sourceAndMap(sourceMapOptions);
                        this.initRunner.then(async runner => {
                            try {
                                let runResult = await runner(source, map, !watching);

                                if (watching) {
                                    handleTestRun(runResult);
                                    
                                    // updateReviewAppDataSource(runResult);
                                } else {
                                    let failingTests = 0;
                                    for (let module of runResult.modules) {
                                        console.log("Test Module -", module.name, '\n');
                                        for (let test of module.tests) {
                                            if (test.error) {
                                                failingTests++;
                                            }
                                            console.log('   ', test.name, '-', test.error ? 'FAIL' : 'SUCCESS');
                                        }
                                        console.log();
                                    }

                                    if (failingTests > 0 && this.stopBuildOnFail) {
                                        // the purpose of stopBuildOnFail is to cause a build error
                                        // when tests fail
                                        console.error(`\n${failingTests} kiwi tests failed\n`);
                                        process.exit(1);
                                    }
                                }
                            } catch (e) {
                                console.log('ERROR', e);
                            }
                        });
                    }
                }
            });
        });
    }
}
