// #SPC-runner
let chromeLauncher = require('chrome-launcher');
let chromeRemoteInterface = require('chrome-remote-interface');
import sourceMap from 'source-map';
import path from 'path';

export type Position = sourceMap.MappedPosition;

export type FileCoverage = {[line: number]: boolean };
export type CoveredFiles = {[path: string]: FileCoverage };
export type TestError = { message: string, trace: Position };
export type TestLog = { args: string[], trace: Position };
export type TestResult = { name: string, error?: TestError, consoleLogs: TestLog[], coveredFiles: CoveredFiles };
export type TestModule = { name: string, tests: TestResult[] };


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
    let functions = profilerResult.result[1].functions
    	.filter((f: any) => f.functionName == 'assert.isNotOk');
    // console.log(profilerResult.result[1].functions.find(n => n.functionName == 'assertProperty'));

    let lineLengths = testSrc.split('\n').map(line => line.length);

    let positionFromOffset = (offset: number): Position =>  {
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
        	startPosition: mapPosition(positionFromOffset(range.startOffset)),
        	endPosition: mapPosition(positionFromOffset(range.endOffset)),
        	count: range.count,
    	}));
    	return {
        	functionName: fn.functionName,
        	ranges,
    	};
	});

	console.log(functions[0].ranges);

	let coveredFiles: CoveredFiles = {};

	for (let fn of functions) {
    	for (let range of fn.ranges) {
        	for (let pos = range.startPosition.line; pos <= range.endPosition.line; pos++) {
            	if (!coveredFiles[range.source]) {
                	coveredFiles[range.source] = {};
            	}
            	coveredFiles[range.source][pos] = range.count != 0;
        	}
    	}
	}

    return {};
}

// #SPC-runner.sourcemap
export async function loadSourceMap(mapSrc: sourceMap.RawSourceMap) {
    
    let consumer = await (new sourceMap.SourceMapConsumer(mapSrc));

    return ({ column, line }: Position) : Position => {
        let pos = consumer.originalPositionFor({ column, line });
        return {
            source: path.join(process.cwd(), (pos.source || '').slice(sourceNamePrefix.length)),
            column: pos.column || 0,
            line: pos.line || 0,
        };
    };
}

// #SPC-runner.launcher
export default async function launchInstance(headless: boolean) {
    
    let chrome = await chromeLauncher.launch({ chromeFlags: ['--disable-gpu' ].concat(headless ? ['--headless'] : []) });
        	
    let { Profiler, Page, Runtime } = await chromeRemoteInterface({ port: chrome.port });

    await Promise.all([Profiler.enable(), Page.enable(), Runtime.enable()]);
   	
	// instead of starting a server and loading the page from it
	// directly load the index file with the embedded sources as a data object
    let encoded = new Buffer(htmlIndex()).toString('base64');
    Page.navigate({ url: 'data:text/html;base64,' + encoded });
    await Page.loadEventFired();

	// Run on every change
	return async (testSrc: string, mapSrc: any, lastRun: boolean) : Promise<TestModule[]> => {

        let mapPosition = await loadSourceMap(mapSrc);

        let testResult = 'false';
        let testCoverages: any[] = [];
        
        await Profiler.startPreciseCoverage({ callCount: false, detailed: true });

        await Runtime.evaluate({ expression: testSrc });
        
        testCoverages.push(await Profiler.takePreciseCoverage());

		while (testResult === 'false') {
            await Profiler.startPreciseCoverage({ callCount: false, detailed: true });
            // #SPC-runner.async
    		testResult = (await Runtime.evaluate({ expression: '__kiwi_runNextTest()', awaitPromise: true})).result.value;
        
            testCoverages.push(await Profiler.takePreciseCoverage());
		}

		// cleanup browser instances
    	if (lastRun) {
        	chrome.kill();
    	}

    	let modules = JSON.parse(testResult);

		// Apply sourcemaps
        modules.forEach((module: TestModule) => {
            module.tests.forEach(test => {
                // takes the first item from testCoverages and computes what lines of what
                // files where ran during the test
                test.coveredFiles = calculateCoverage(testCoverages.shift(), testSrc, mapPosition);
                if (test.error) {
                    test.error.trace = mapPosition(test.error.trace);
                }
                test.consoleLogs.forEach(log => {
                    log.trace = mapPosition(log.trace);
                });
            });
        });

        return modules;
	}
}
