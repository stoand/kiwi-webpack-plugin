// important: run `npm i; npm run build` in `examples/banks`
// so that the dist files are available

import launchInstance from './runner';
import { readFileSync } from 'fs';

let testSrc = readFileSync('examples/bank/dist/kiwi-tests.js', { encoding: 'utf8' });
let mapsSrc = readFileSync('examples/bank/dist/kiwi-tests.js.map', { encoding: 'utf8' });

// #SPC-runner.tst-launcher
// launchInstance(true).then(handleSource => handleSource(testSrc, JSON.parse(mapsSrc), true))
// 	.then(results => {
//     	console.log(JSON.stringify(results));
// 	});

let profilerResult = {"result":[{"scriptId":"3","url":"massive_code source was here","functions":[{"functionName":"__kiwi_runNextTest","ranges":[{"startOffset":793,"endOffset":1627,"count":1},{"startOffset":1081,"endOffset":1626,"count":0}],"isBlockCoverage":true}]},{"scriptId":"5","url":"","functions":[{"functionName":"","ranges":[{"startOffset":0,"endOffset":20,"count":1}],"isBlockCoverage":true}]}]}

// #SPC-runner.tst-coverage
export function test_coverage() {
    
}

test_coverage();
