// #SPC-runner
let chromeLauncher = require('chrome-launcher');
let chromeRemoteInterface = require('chrome-remote-interface');
import { spawn } from 'child_process';
import sourceMap from 'source-map';
import path from 'path';

export type Position = sourceMap.MappedPosition;


export type FileLengths = { [file: string]: number };
export type FileCoverage = { [line: number]: boolean };
export type CoveredFiles = { [path: string]: FileCoverage };
export type TestError = { message: string, trace: Position, stack: Position[], rawStack: string, notErrorInstance?: boolean };
export type TestLog = { args: string[], trace: Position, stack: Position[], rawStack: string };
export type TestResult = { name: string, trace: Position, stack: Position[], rawStack: string, error?: TestError,
	consoleLogs: TestLog[], coveredFiles: CoveredFiles };
export type TestModule = { name: string, tests: TestResult[] };
export type InitRunner = Promise<(testSrc: string, mapSrc: any, lastRun: boolean) => Promise<RunResult>>;

export type RunResult = { modules: TestModule[], fileLengths: FileLengths };

export const emptyRunResult = { modules: [], fileLengths: {} };

let runtime = require('./runtime.raw.js').default;

let sourceNamePrefix = 'webpack:///';
let ignoreSourcePrefixes = ['node_modules', '(webpack)', 'webpack'];

let randomNodePortBase = 9195;

function now() {
    return new Date();
}

// #SPC-runner.log_time
function logTime(label: string, start?: Date, end: Date = now()) {
    if (process.env['KIWI_LOG_TIME']) {
        if (start) {
            console.log(label, end.getTime() - start.getTime(), 'ms');
        } else {
            console.log(label);
        }
    }
}

function htmlIndex() {
    return `
        <!doctype html>

        <html lang="en">
        <head>
          <meta charset="utf-8">

          <title>Kiwi Tests</title>
          <script>${runtime}</script>
        </head>

        <body>
        </body>
        </html>
    `;
}

export function calcAccumulatedLineLengths(src: string): number[] {
    
    let lengths = src.split('\n').map(line => line.length);
    
    let acc = 0;
    for (let i = 0; i < lengths.length; i++) {
        acc += lengths[i];
        lengths[i] = acc;
    }

    return lengths;
}

// todo - extract into separate function, add tests, rewrite to use log search
export function positionFromOffset (offset: number, accumulatedLineLengths: number[]): Position {

    // console.log('count,', count++, offset)
    
    // very badly needs to be optimized - 'apply source maps' is severely slowed
    // return { line: 1, column: 1, source: '' };
    
    // let currentOffset = 0;
    // let previousOffset = 0;
    // for (let i = 0; i < lineLengths.length; i++) {
    //     let lineLength = lineLengths[i];
    //     currentOffset += lineLength + 1;

    //     if (currentOffset > offset) {
    //         return { line: i + 1, column: (offset - previousOffset) + 1, source: '' };
    //     }

    //     previousOffset = currentOffset;
    // }

    return { line: 1, column: 1, source: '' };
}


// #SPC-runner.coverage
export function calculateCoverage(profilerResult: any, accumulatedLineLengths: number[], mapPosition: (p: Position) => Position): CoveredFiles {
    
    let functions = profilerResult.result.find((r: any) => r.url == '').functions;

    // convert offsets to sourcemapped positions
    functions = functions.map((fn: any) => {
        let ranges = fn.ranges.map((range: any) => ({
            startOffset: range.startOffset,
            endOffset: range.endOffset,

            startPosition: mapPosition(positionFromOffset(range.startOffset, accumulatedLineLengths)),
            endPosition: mapPosition(positionFromOffset(range.endOffset, accumulatedLineLengths)),
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

        let ignore = false;

        for (let ignorePrefix of ignoreSourcePrefixes) {
            if (pos?.source?.indexOf(sourceNamePrefix + ignorePrefix) == 0) {
                ignore = true;
            }
        }

        return {
            source: pos.source && !ignore ? absoluteSourcePath(pos.source) : '',
            column: pos.column || 0,
            line: pos.line || 0,
        };
    };
}

// #SPC-runner.launcher
export default async function launchInstance(headless: boolean | undefined = true, runner: 'node' | 'chrome' = 'chrome') {

    let chrome: any, node: any, Profiler: any, Page: any, Runtime: any;
    let lastRestart: Promise<any>;

    async function restartRunner() {
        return new Promise(resolve =>
            // the code below contains blocking functions
            setTimeout(() => {
                let run = async () => {
                    if (runner == 'node') {
                        let port = randomNodePortBase + Math.floor(Math.random() * 1000);
                        
                        node = spawn('node', ['--cpu-prof', `--inspect=${port}`, '-e', 'setInterval(()=>{}, 500)']);

                        let remote;

                        for (let i = 0; i < 40; i++) {
                            try {
                                remote = await chromeRemoteInterface({ port });
                                break;
                            } catch (e) {
                                // console.error(e);
                            }
                        }


                        Profiler = remote.Profiler;
                        Runtime = remote.Runtime;

                        await Promise.all([Profiler.enable(), Runtime.enable()]);
                        await Runtime.evaluate({ expression: runtime, awaitPromise: true });
                        
                    } else if (runner == 'chrome') {
                        
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
                }

                resolve(run());
            }));
    }

    lastRestart = restartRunner();

    // Run on every change
    return async (testSrc: string, mapSrc: any, lastRun: boolean): Promise<RunResult> => {

        await lastRestart;

        let beforeLoadSrcMap = now();

        let srcMapConsumer = await (new sourceMap.SourceMapConsumer(mapSrc));
        
        
        let mapPosition = await loadSourceMap(srcMapConsumer);
        
        let afterLoadSrcMap = now();

        let testCoverages: any[] = [];
        
        let testCounter = 0;

        let modules: TestModule[] = [];

        let beforeRunTests = now();

        while (true) {

            let beforeCoverage = now();

            if (runner == 'node') {
                // callCount needs to be true
                // since having it false breaks nested blocks being empty
                // having it true breaks everything though
                // need to find a solution here
                await Profiler.startPreciseCoverage({ callCount: false, detailed: false });
            }
                
            if (runner == 'chrome') {
                await Profiler.startPreciseCoverage({ callCount: true, detailed: true });
            }

            logTime('coverage', beforeCoverage);

            let beforeEval = now();
            
            await Runtime.evaluate({ expression: testSrc, awaitPromise: true });
            logTime('eval', beforeEval);
            
            let beforeRun = now();
            
            // #SPC-runner.async
            let rawRes = (await Runtime.evaluate({ expression: `__kiwi_runTest(${testCounter})`, awaitPromise: true }))
            let testRun = rawRes?.result?.value;
            
            logTime('run', beforeRun);
            
            if (!testRun || testRun == 'done') {
                break;
            } else {
                let run = JSON.parse(testRun);
                let mod = modules.find(m => m.name == run.mod);
                if (!mod) {
                    mod = { name: run.mod, tests: [] };
                    modules.push(mod);
                }

                mod.tests.push(run.testRef);
            }

            
            testCounter++;

            let beforeTakeCoverage = now();

            testCoverages.push(await Profiler.takePreciseCoverage());

            logTime('takecoverage', beforeTakeCoverage);

            let beforeReload = now();
            
            if (runner == 'chrome') {
                await Page.reload();
            }

            logTime('beforeReload', beforeReload)

            logTime('total', beforeCoverage)

            logTime('----------');
        }

        logTime('\n\nloadSrcMap', beforeLoadSrcMap, afterLoadSrcMap);

        logTime('running all tests', beforeRunTests);

        if (runner == 'node') {
            node.kill();
        }

        if (runner == 'chrome') {
            chrome.kill();

        }
        
        if (!lastRun) {
            // wait for this later
            lastRestart = restartRunner();
        }

        let beforeCalcLengths = now();

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

        function extractTrace(stack: string, startRow: number): Position[] {
            let positions = [];
            
            let lines = stack.split('\n');
            for (let i = startRow; i < lines.length; i++) {
                let item = lines[i];
                let parts = item.slice(-50).split(':');
                let line = Number(parts[parts.length - 2]);
                let column = Number(parts[parts.length - 1].replace(')', ''));

                let pos = mapPosition({ column, line, source: '' });
                if (pos.source) {
                    positions.push(pos);
                }
            }

            return positions;
        }

        logTime('calc lengths', beforeCalcLengths);

        let beforeApplySourceMaps = now();

        let accumulatedLineLengths = calcAccumulatedLineLengths(testSrc);
        
        // Apply sourcemaps
        modules.forEach((module: TestModule) => {
            module.tests.forEach(test => {
                test.stack = extractTrace(test.rawStack, 2);
                test.trace = test.stack[0];

                // takes the first item from testCoverages and computes what lines of what
                // files where ran during the test
                test.coveredFiles = calculateCoverage(testCoverages.shift(), accumulatedLineLengths, mapPosition);

                if (test.error) {
                    // if "throw 1" instead of "throw new Error(1)" is used
                    if (test.error.notErrorInstance) {
                        test.error.stack = extractTrace(test.rawStack, 2);
                        
                        test.error.trace = test.error.stack[0];
                        test.error.trace.line += 1;
                    } else {
                        test.error.stack = extractTrace(test.error.rawStack, 1);
                        test.error.trace = test.error.stack[0];
                    }
                }
                test.consoleLogs.forEach(log => {
                    log.stack = extractTrace(log.rawStack, 2);
                    log.trace = log.stack[0];
                });
            });
        });

        logTime('apply source maps', beforeApplySourceMaps);

        return { modules, fileLengths };
    }
}
