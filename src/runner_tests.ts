// important: run `npm i; npm run build` in `examples/minimal/`
// so that the dist files are available

import launchInstance, { calculateCoverage, loadSourceMap } from './runner';
import { readFileSync } from 'fs';
import { expect } from 'chai';

let testSrc = readFileSync('examples/minimal/dist/kiwi-tests.js', { encoding: 'utf8' });
let mapSrc = readFileSync('examples/minimal/dist/kiwi-tests.js.map', { encoding: 'utf8' });

// #SPC-runner.tst-launcher
launchInstance(true).then(handleSource => handleSource(testSrc, JSON.parse(mapSrc), true))
	.then(results => {
    	// console.log(results);
    	// console.log(JSON.stringify(results));
	});


expect(1).to.equal(1)

let testCoverages: any = [];

// #SPC-runner.tst-coverage
export async function test_coverage() {
    let mapPosition = await loadSourceMap(JSON.parse(mapSrc));

    calculateCoverage(testCoverages[0], testSrc, mapPosition);
}

test_coverage();
