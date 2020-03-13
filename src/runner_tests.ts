import runner from './runner';

let src = `
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

runner().then(handleSource => handleSource(src));
