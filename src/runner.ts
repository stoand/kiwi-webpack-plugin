// #SPC-runner
let chromeLauncher = require('chrome-launcher');
let chromeRemoteInterface = require('chrome-remote-interface');
import sourceMap from 'source-map';
import path from 'path';

export type Position = sourceMap.MappedPosition;

export type FileCoverage = {[ line: number]: boolean };
export type CoveredFiles = {[ path: string]: FileCoverage };
export type TestError = { message: string, trace: Position, notErrorInstance?: boolean };
export type TestLog = { args: string[], trace: Position };
export type TestResult = { name: string, trace: Position, error?: TestError, consoleLogs: TestLog[], coveredFiles: CoveredFiles };
export type TestModule = { name: string, tests: TestResult[] };

export type RunResult = Promise<{ modules: TestModule[], initialCoverage: CoveredFiles }>;

let browserRuntime = require('./browser_runtime.raw.js').default;

let sourceNamePrefix = 'webpack:///';

function htmlIndex() {
    return `
        <!doctype html>

        <html lang="en">
        <head>
          <meta charset="utf-8">

          <title>Kiwi Tests</title>
          <script>${browserRuntime}</script>
        </head>

        <body>
        </body>
        </html>
    `;
}

// #SPC-runner.coverage
export function calculateCoverage(profilerResult: any, testSrc: string, mapPosition: (p: Position) => Position): CoveredFiles {
    let functions = profilerResult.result.find((r: any) => r.url == '').functions;

    let lineLengths = testSrc.split('\n').map(line => line.length);

    let positionFromOffset = (offset: number): Position => {
        let currentOffset = 0;
        let previousOffset = 0;
        for (let i = 0; i < lineLengths.length; i++) {
            let lineLength = lineLengths[i];
            currentOffset += lineLength + 1;

            if (currentOffset > offset) {
                return { line: i + 1, column: (offset - previousOffset) + 1, source: '' };
            }

            previousOffset = currentOffset;
        }

        return { line: 1, column: 1, source: '' };
    };

    // convert offsets to sourcemapped positions
    functions = functions.map((fn: any) => {
        let ranges = fn.ranges.map((range: any) => ({
            startOffset: range.startOffset,
            endOffset: range.endOffset,

            startFromOffset: positionFromOffset(range.startOffset),
            endFromOffset: positionFromOffset(range.endOffset),

            startPosition: mapPosition(positionFromOffset(range.startOffset)),
            endPosition: mapPosition(positionFromOffset(range.endOffset)),
            count: range.count,
        })).filter((range: any) =>
            range.startPosition.source && range.startPosition.source.indexOf('node_modules') == -1);

        return {
            functionName: fn.functionName,
            ranges,
        };
    }).filter((fn: any) => fn.ranges.length > 0);

    let coveredFiles: CoveredFiles = {};

    for (let fn of functions) {
        for (let range of fn.ranges) {
            let changes: any = {};
            for (let pos = range.startPosition.line + 1; pos < range.endPosition.line; pos++) {
                let source = range.startPosition.source;
                if (!coveredFiles[source]) {
                    coveredFiles[source] = {};
                }
                coveredFiles[source][pos] = range.count != 0;
                changes[pos] = range.count;
            }
        }
    }

    return coveredFiles;
}

// #SPC-runner.sourcemap
export async function loadSourceMap(mapSrc: sourceMap.RawSourceMap) {

    let consumer = await (new sourceMap.SourceMapConsumer(mapSrc));

    return ({ column, line }: Position): Position => {
        let pos = consumer.originalPositionFor({ column, line });
        return {
            source: pos.source ? path.join(process.cwd(), pos.source.slice(sourceNamePrefix.length)) : '',
            column: pos.column || 0,
            line: pos.line || 0,
        };
    };
}

// #SPC-runner.launcher
export default async function launchInstance(headless: boolean) {

    let chrome: any, Profiler: any, Page: any, Runtime: any;
    let lastRestart: Promise<any>;

    async function restartChrome() {
        return new Promise(resolve =>
        	// the block below contains blocking functions
            setTimeout(() => {
                let run = async () => {
                    chrome = await chromeLauncher.launch({ chromeFlags: ['--disable-gpu'].concat(headless ? ['--headless'] : []) });

                    let remote = await chromeRemoteInterface({ port: chrome.port });

                    Profiler = remote.Profiler;
                    Page = remote.Page;
                    Runtime = remote.Runtime;

                    await Promise.all([Profiler.enable(), Page.enable(), Runtime.enable()]);

                    // instead of starting a server and loading the page from it
                    // directly load the index file with the embedded sources as a data object
                    let encoded = new Buffer(htmlIndex()).toString('base64');
                    Page.navigate({ url: 'data:text/html;base64,' + encoded });
                    await Page.loadEventFired();
                }
                
                resolve(run());
            }));
    }

    lastRestart = restartChrome();

    // Run on every change
    return async (testSrc: string, mapSrc: any, lastRun: boolean): RunResult => {

        await lastRestart;

        let mapPosition = await loadSourceMap(mapSrc);

        let testResult = 'false';
        let testCoverages: any[] = [];

        await Profiler.startPreciseCoverage({ callCount: false, detailed: true });

        await Runtime.evaluate({ expression: testSrc });

        testCoverages.push(await Profiler.takePreciseCoverage());

        while (testResult === 'false') {
            await Profiler.startPreciseCoverage({ callCount: false, detailed: true });
            // #SPC-runner.async
            testResult = (await Runtime.evaluate({ expression: '__kiwi_runNextTest()', awaitPromise: true} )).result.value;

            testCoverages.push(await Profiler.takePreciseCoverage());
        }
        
        chrome.kill();

        if (!lastRun) {
            // wait for this later
            lastRestart = restartChrome();
        }

        let modules: TestModule[] = JSON.parse(testResult);

        let initialCoverage: any;

        initialCoverage = calculateCoverage(testCoverages.shift(), testSrc, mapPosition);

        // Apply sourcemaps
        modules.forEach((module: TestModule) => {
            module.tests.forEach(test => {
                // takes the first item from testCoverages and computes what lines of what
                // files where ran during the test

                test.coveredFiles = calculateCoverage(testCoverages.shift(), testSrc, mapPosition);

                if (test.error) {
                    test.error.trace = mapPosition(test.error.trace);
                    
                    // if "throw 1" instead of "throw new Error(1)" is used
                    if (test.error.notErrorInstance) {
                        test.error.trace = test.trace;
                        test.error.trace.line += 1;
                    }
                }
                test.consoleLogs.forEach(log => {
                    log.trace = mapPosition(log.trace);
                });
                test.trace = mapPosition(test.trace);
            });
        });

        return { modules, initialCoverage };
    }
}
