// important: run `npm i; npm run build` in `examples/banks`
// so that the dist files are available

import runner from './runner';
import { readFileSync } from 'fs';

let testSrc = readFileSync('examples/bank/dist/kiwi-tests.js', { encoding: 'utf8' });
let mapsSrc = readFileSync('examples/bank/dist/kiwi-tests.js.map', { encoding: 'utf8' });

runner(true).then(handleSource => handleSource(testSrc, JSON.parse(mapsSrc), true));
