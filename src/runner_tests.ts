// important: run `npm i; npm run build` in `examples/banks`
// so that the dist files are available

import launchInstance, { calculateCoverage, loadSourceMap } from './runner';
import { readFileSync } from 'fs';

let testSrc = readFileSync('examples/bank/dist/kiwi-tests.js', { encoding: 'utf8' });
let mapSrc = readFileSync('examples/bank/dist/kiwi-tests.js.map', { encoding: 'utf8' });

// #SPC-runner.tst-launcher
// launchInstance(true).then(handleSource => handleSource(testSrc, JSON.parse(mapsSrc), true))
// 	.then(results => {
//     	console.log(JSON.stringify(results));
// 	});

let testCoverages: any = [];

// #SPC-runner.tst-coverage
export async function test_coverage() {
	try {
	
    let mapPosition = await loadSourceMap(JSON.parse(mapSrc));
    
    calculateCoverage(testCoverages[0], testSrc, mapPosition);
    
	} catch(e) {
    	console.error('err', e);
	}
}

test_coverage();
