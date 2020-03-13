import runner from './runner';
import { readFileSync } from 'fs';

let src1 = `
(function() {
    let a = false;

    if(a) {
        console.log('a');
    }

    let b = true;
    
    if(b) {
        console.log('b');
    }
});
`;

let src = readFileSync('examples/bank/dist/kiwi-tests.js', { encoding: 'utf8' });

runner().then(handleSource => handleSource(src, ''));
