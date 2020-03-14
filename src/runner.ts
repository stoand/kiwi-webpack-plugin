let chromeLauncher = require('chrome-launcher');
let chromeRemoteInterface = require('chrome-remote-interface');
let toIstanbul = require('v8-to-istanbul');
import sourceMap from 'source-map';

export type Trace = { column: number, line: number };
export type TestError = { message: string, trace: Trace };
export type TestLog = { args: string[], trace: Trace };
export type TestResult = { name: string, error?: TestError, consoleLogs: TestLog[] };
export type TestModule = { name: string, tests: TestResult[] };

let browserRuntime = require('./browser_runtime.raw.js').default;

function htmlIndex(testSrc: string) {
    return `
        <!doctype html>

        <html lang="en">
        <head>
          <meta charset="utf-8">

          <title>Kiwi Tests</title>
          <script>${browserRuntime}</script>
          <script>${testSrc}</script>
        </head>

        <body>
        </body>
        </html>
    `;
}

// async function reformatCoverage(coverageResult: any) {
//     return Promise.all(coverageResult.map(async (file: any) => {
//         let converter = toIstanbul('/home/andreas/kiwi/examples/bank/dist/kiwi-tests.js');
//         try {
//         await converter.load();
//         converter.applyCoverage(file.functions);
//         } catch(e) { console.log(e) }
//         return converter.toIstanbul();
//     }));
// }

export default async function runner(headless: boolean) {
    
    let chrome = await chromeLauncher.launch({ chromeFlags: ['--disable-gpu' ].concat(headless ? ['--headless'] : []) });
        	
    let { Profiler, Page, Runtime } = await chromeRemoteInterface({ port: chrome.port });

    await Promise.all([Profiler.enable(), Page.enable(), Runtime.enable()]);

	// Run on every change
	return async (testSrc: string, mapsSrc: any, lastRun: boolean) : Promise<TestModule[]> => {
   	
    	// instead of starting a server and loading the page from it
    	// directly load the index file with the embedded sources as a data object
        let encoded = new Buffer(htmlIndex(testSrc)).toString('base64');
        Page.navigate({ url: 'data:text/html;base64,' + encoded });
        await Page.loadEventFired();

        let testResult = 'false';
        let testCoverages = [];

		while (testResult === 'false') {
            await Profiler.startPreciseCoverage({ callCount: false, detailed: true });
    		testResult = (await Runtime.evaluate({ expression: 'JSON.stringify(__kiwi_runNextTest())'})).result.value;
        
            testCoverages.push(await Profiler.takePreciseCoverage());
		}

		// cleanup browser instances
    	if (lastRun) {
        	chrome.kill();
    	}
		
        return JSON.parse(testResult);
	}
}
