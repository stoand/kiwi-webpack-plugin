let chromeLauncher = require('chrome-launcher');
let chromeRemoteInterface = require('chrome-remote-interface');
let toIstanbul = require('v8-to-istanbul');
import sourceMap from 'source-map';

const serverPort = 6184;
const sourceMapStart = '//# sourceMappingURL=data:application/json;charset=utf-8;base64,';

export function describe(name: string, fn: Function) {
    console.log('running module', name);
    fn();
}

export function it(name: string, fn: Function) {
    console.log('running test', name);
    fn();
}

function htmlIndex(testSrc: string) {
    return `
        <!doctype html>

        <html lang="en">
        <head>
          <meta charset="utf-8">

          <title>Kiwi Tests</title>
          <script>
          function describe() {}
          function it() {}
          ${testSrc}
          </script>

        </head>

        <body>
        </body>
        </html>
    `;
}

async function reformatCoverage(coverageResult: any) {
    return Promise.all(coverageResult.map(async (file: any) => {
        let converter = toIstanbul('/home/andreas/kiwi/examples/bank/dist/kiwi-tests.js');
        try {
        await converter.load();
        converter.applyCoverage(file.functions);
        } catch(e) { console.log(e) }
        return converter.toIstanbul();
    }));
}

export default async function runner() {
    
    let chrome = await chromeLauncher.launch({ chromeFlags: ['--disable-gpu', '--headless'] });
    let { Profiler, Page } = await chromeRemoteInterface({ port: chrome.port });

    await Profiler.enable();
	await Page.enable();

	// Run on every change
	return async (testSrc: string, mapsSrc: any) => {
        await Profiler.startPreciseCoverage({ callCount: true, detailed: true });

		// Instead of starting a server and loading a page from it
		// simply load the index with the test source embedded as an inline data object
        let encoded = new Buffer(htmlIndex(testSrc)).toString('base64');

        Page.navigate({ url: 'data:text/html;base64,' + encoded });
               
        await Page.loadEventFired();
        
        let { result } = await Profiler.takePreciseCoverage();
        console.log(result);
        // try {
        // // console.log(result)
        // } catch (e) { console.log(e); }
        // console.log(result.result[0].functions[1].ranges);
        
        // let run = new Function('describe', 'it', testSrc);
        // try {
        //     run(describe, it);
        // } catch (e) { console.log(e); }
	}
}
