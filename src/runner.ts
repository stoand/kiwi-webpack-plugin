function describe(name, fn) {
    console.log('running module', name);
    fn();
}

function it(name, fn) {
    console.log('running test', name);
    fn();
}

export default function runner(testSrc) {
    let run = new Function('describe', 'it', testSrc);
    try {
        run(describe, it);
    } catch (e) { console.log(e); }
    
}
