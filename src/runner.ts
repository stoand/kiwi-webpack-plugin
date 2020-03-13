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

export default async function runner(testSrc: string) {
    let server = createServer((_, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.writeHead(200);
        res.end(testSrc);
    });
    server.listen(serverPort);
    
    let chrome = await chromeLauncher.launch({ chromeFlags: ['--disable-gpu', '--headless'] });
    console.log('2');
    let { Profiler, Page } = await chromeRemoteInterface({ port: chrome.port });

    await Profiler.enable();
	await Page.enable();

    await Profiler.startPreciseCoverage();

    Page.navigate({ url: 'http://localhost:' + serverPort });
    await Page.loadEventFired();
    
    // let run = new Function('describe', 'it', testSrc);
    // try {
    //     run(describe, it);
    // } catch (e) { console.log(e); }
}
