// important: run `npm i; npm run build` in `examples/minimal/`
// so that the dist files are available

import launchInstance, { positionFromOffset, calculateCoverage, loadSourceMap } from './runner';
import { readFileSync } from 'fs';
import { expect } from 'chai';

let testSrc = readFileSync('examples/minimal/dist/kiwi-tests.js', { encoding: 'utf8' });
let mapSrc = readFileSync('examples/minimal/dist/kiwi-tests.js.map', { encoding: 'utf8' });

describe('Runner', () => {

    // #SPC-runner.tst-launcher
    it('can launch instance', () => {
        // launchInstance(true).then(handleSource => handleSource(testSrc, JSON.parse(mapSrc), true))
        // 	.then(_results => {
        //     	// console.log(results);
        //     	// console.log(JSON.stringify(results));
        // 	});
    });

    it('can calculate line and column from char offset', () => {
        let src = `asdf\n12\nrandom`;

        let accumulatedLineLengths = [4, 6, 12];

        expect(positionFromOffset(0, accumulatedLineLengths)).to.eql({ line: 1, column: 1, source: '' });
    });

    // #SPC-runner.tst-coverage
    it('can calculate coverage', async () => {
        // let testCoverages: any = [];
        // let mapPosition = await loadSourceMap(JSON.parse(mapSrc));
        // calculateCoverage(testCoverages[0], testSrc, mapPosition);
    });
});
