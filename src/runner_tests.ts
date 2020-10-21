// important: run `npm i; npm run build` in `examples/minimal/`
// so that the dist files are available

import launchInstance, { calcAccumulatedLineLengths, positionFromOffset,
    calculateCoverage, loadSourceMap, findLowerIndexInRangeArray } from './runner';
import { readFileSync } from 'fs';
import { expect } from 'chai';
import sourceMap from 'source-map';
import path from 'path';

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
        // let src = `asdf\n12\nrandom`;

        let accumulatedLineLengths = [0, 4, 7, 14];
        

        expect(positionFromOffset(0, accumulatedLineLengths)).to.eql({ line: 1, column: 1, source: '' });

        expect(positionFromOffset(5, accumulatedLineLengths)).to.eql({ line: 2, column: 1, source: '' });
        
        expect(positionFromOffset(8, accumulatedLineLengths)).to.eql({ line: 3, column: 1, source: '' });
        
        expect(positionFromOffset(10, accumulatedLineLengths)).to.eql({ line: 3, column: 3, source: '' });
    });

    // #SPC-runner.tst-coverage
    it('source maps work', async () => {
        let srcMapConsumer = await (new sourceMap.SourceMapConsumer(mapSrc));
        let mapPosition = await loadSourceMap(srcMapConsumer);

        let actualPosition = mapPosition({ line: 11370, column: 1, source: '' });
        expect(actualPosition).to.eql({ line: 22, column: 0, source: path.resolve('src/tests.ts') });
    });

    it('can calc accumulated line lengths', () => {
        let src = `asdf\n12\nrandom`;
        let accumulatedLineLengths = [0, 4, 7, 14];
        expect(calcAccumulatedLineLengths(src)).to.eql(accumulatedLineLengths);
    });
});
