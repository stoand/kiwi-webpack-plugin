let chromeLauncher = require('chrome-launcher');
let chromeRemoteInterface = require('chrome-remote-interface');
let toIstanbul = require('v8-to-istanbul');
import sourceMap from 'source-map';
import path from 'path';

export type Position = sourceMap.MappedPosition;

export type TestError = { message: string, trace: Position };
export type TestLog = { args: string[], trace: Position };
export type TestResult = { name: string, error?: TestError, consoleLogs: TestLog[] };
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

// #SPC-runner.sourcemap
export async function loadSourceMap(mapSrc: sourceMap.RawSourceMap) {
    
    let consumer = await (new sourceMap.SourceMapConsumer(mapSrc));

    return ({ column, line }: Position) : Position => {
        let pos = consumer.originalPositionFor({ column: column, line });
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
        let testCoverages = [];

        await Runtime.evaluate({ expression: testSrc });

		while (testResult === 'false') {
            await Profiler.startPreciseCoverage({ callCount: false, detailed: true });
    		testResult = (await Runtime.evaluate({ expression: 'JSON.stringify(__kiwi_runNextTest())'})).result.value;
        
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
