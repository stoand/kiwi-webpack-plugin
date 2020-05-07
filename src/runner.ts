// #SPC-runner
let chromeLauncher = require('chrome-launcher');
let chromeRemoteInterface = require('chrome-remote-interface');
import sourceMap from 'source-map';
import path from 'path';

export type Position = sourceMap.MappedPosition;


export type FileLengths = { [file: string]: number };
export type FileCoverage = { [line: number]: boolean };
export type CoveredFiles = { [path: string]: FileCoverage };
export type TestError = { message: string, trace: Position, rawStack: string, notErrorInstance?: boolean };
export type TestLog = { args: string[], trace: Position, rawStack: string };
export type TestResult = { name: string, trace: Position, rawStack: string, error?: TestError,
	consoleLogs: TestLog[], coveredFiles: CoveredFiles };
export type TestModule = { name: string, tests: TestResult[] };
export type InitRunner = Promise<(testSrc: string, mapSrc: any, lastRun: boolean) => Promise<RunResult>>;

export type RunResult = { modules: TestModule[], initialCoverage: CoveredFiles, fileLengths: FileLengths };

export const emptyRunResult = { modules: [], initialCoverage: {}, fileLengths: {} };

let browserRuntime = require('./browser_runtime.raw.js').default;

let sourceNamePrefix = 'webpack:///';
let ignoreSourcePrefixes = ['node_modules', '(webpack)', 'webpack'];

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

function absoluteSourcePath(source : string) {
    return path.join(process.cwd(), source.slice(sourceNamePrefix.length));
}

// #SPC-runner.sourcemap
export async function loadSourceMap(consumer: sourceMap.SourceMapConsumer) {

    return ({ column, line }: Position): Position => {
        let pos = consumer.originalPositionFor({ column, line });
        return {
            source: pos.source ? absoluteSourcePath(pos.source) : '',
            column: pos.column || 0,
            line: pos.line || 0,
        };
    };
}

function extractTrace(stack: string, row: number): Position {
    let parts = stack.split('\n')[row].slice(-50).split(':');
    let line = Number(parts[parts.length - 2]);
    let column = Number(parts[parts.length - 1].replace(')', ''));
    return { column, line, source: '' };
}

// #SPC-runner.launcher
export default async function launchInstance(headless: boolean) {

    let chrome: any, Profiler: any, Page: any, Runtime: any;
    let lastRestart: Promise<any>;

    async function restartChrome() {
        return new Promise(resolve =>
            // the code below contains blocking functions
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
    return async (testSrc: string, mapSrc: any, lastRun: boolean): Promise<RunResult> => {

        await lastRestart;

        let srcMapConsumer = await (new sourceMap.SourceMapConsumer(mapSrc));
        
        let mapPosition = await loadSourceMap(srcMapConsumer);

        let testResult = 'false';
        let testCoverages: any[] = [];

        await Profiler.startPreciseCoverage({ callCount: false, detailed: true });

        await Runtime.evaluate({ expression: testSrc });

        testCoverages.push(await Profiler.takePreciseCoverage());

        while (testResult === 'false') {
            await Profiler.startPreciseCoverage({ callCount: false, detailed: true });
            // #SPC-runner.async
            testResult = (await Runtime.evaluate({ expression: '__kiwi_runNextTest()', awaitPromise: true })).result.value;

            testCoverages.push(await Profiler.takePreciseCoverage());
        }

        chrome.kill();

        if (!lastRun) {
            // wait for this later
            lastRestart = restartChrome();
        }

        // #SPC-runner.file_lengths
        // calculate file lengths
		let fileLengths: FileLengths = {};
        for (let sourceIndex = 0; sourceIndex < srcMapConsumer.sources.length; sourceIndex++) {
            let source = srcMapConsumer.sources[sourceIndex];
            let ignore = false;

            for (let ignorePrefix of ignoreSourcePrefixes) {
                if (source.indexOf(sourceNamePrefix + ignorePrefix) == 0) {
                    ignore = true;
                }
            }
            
            if (!ignore) {
                fileLengths[absoluteSourcePath(source)] =
                	srcMapConsumer.sourcesContent[sourceIndex].split('\n').length - 1;
            }
        }

        let modules: TestModule[] = JSON.parse(testResult);

        let initialCoverage: any;

        initialCoverage = calculateCoverage(testCoverages.shift(), testSrc, mapPosition);

        // Apply sourcemaps
        modules.forEach((module: TestModule) => {
            
            module.tests.forEach(test => {
                test.trace = mapPosition(extractTrace(test.rawStack, 2));

                // takes the first item from testCoverages and computes what lines of what
                // files where ran during the test
                test.coveredFiles = calculateCoverage(testCoverages.shift(), testSrc, mapPosition);

                if (test.error) {
                    // if "throw 1" instead of "throw new Error(1)" is used
                    if (test.error.notErrorInstance) {
                        test.error.trace = test.trace;
                        test.error.trace.line += 1;
                    } else {
                        test.error.trace = mapPosition(extractTrace(test.error.rawStack, 1));
                    }
                }
                test.consoleLogs.forEach(log => {
                    log.trace = mapPosition(extractTrace(log.rawStack, 2));
                });
            });
        });

        return { modules, initialCoverage, fileLengths };
    }
}
