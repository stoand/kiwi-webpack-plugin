export function describe(name: string, fn: Function) {
    console.log('running module', name);
    fn();
}

export function it(name: string, fn: Function) {
    console.log('running test', name);
    fn();
}

export default function runner(testSrc: string) {
    let run = new Function('describe', 'it', testSrc);
    try {
        run(describe, it);
    } catch (e) { console.log(e); }
}
