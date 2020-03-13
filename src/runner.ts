let chromeLauncher = require('chrome-launcher');
let chromeRemoteInterface = require('chrome-remote-interface');
import { createServer } from 'http';

const serverPort = 6184;

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
          ${testSrc}
          </script>

        </head>

        <body>
        </body>
        </html>
    `;
}

export default async function runner() {
    // Setup
    let servedSrc = '';
    let server = createServer((_, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        res.end(htmlIndex(servedSrc));
    });
    
    server.listen(serverPort);
    
    let chrome = await chromeLauncher.launch({ chromeFlags: ['--disable-gpu', '--headless'] });
    let { Profiler, Page } = await chromeRemoteInterface({ port: chrome.port });

    await Profiler.enable();
	await Page.enable();

	// Run on every change
	return async (testSrc: string) => {
    	servedSrc = testSrc;
    	
        await Profiler.startPreciseCoverage({ callCount: true, detailed: true });

        Page.navigate({ url: 'http://localhost:' + serverPort });

        
        await Page.loadEventFired();
        
        let result = await Profiler.takePreciseCoverage();
        console.log(result.result[0].functions);
        
        // let run = new Function('describe', 'it', testSrc);
        // try {
        //     run(describe, it);
        // } catch (e) { console.log(e); }
	}
}
