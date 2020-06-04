let __kiwi_testModules = [];
let __kiwi_definingModule;

let __kiwi_runningTest;
let __kiwi_oldConsoleLog = console.log;

// #SPC-runner.logs
console.log = (...args) => {
    if (__kiwi_runningTest) {
        // Use a caught error to generate a stack trace
        try {
            throw new Error();
        } catch (e) {
            // trace: __kiwi_extractTrace(e.stack, 2)
            __kiwi_runningTest.consoleLogs.push({ args, rawStack: e.stack });
        }
    }

    __kiwi_oldConsoleLog(...args);
}

async function __kiwi_runNextTest(counter) {

    let testRefs = [];

    for (let mod of __kiwi_testModules) {
        for (let test of mod.tests) {
            testRefs.push({ mod: mod.name, testRef: test });
        }
    }

    let test = testRefs[counter].testRef;
    
    if (!test) return 'done';
    
    __kiwi_runningTest = test;
    
    // #SPC-runner.errors
    try {
        await test.run();
    } catch(e) {
        if (e instanceof Error) {
            // trace: __kiwi_extractTrace(e.stack, 1), 
            test.error = { message: e.message, rawStack: e.stack, expected: e.expected, actual: e.actual };
        } else {
            // The thrown value is not a real error and does not have a stack trace
            test.error = { message: e.toString(), notErrorInstance: true };
        }
    }

    return JSON.stringify(testRefs[counter]);
}

function describe(name, run) {
    let module = { name, tests: [] };
    __kiwi_testModules.push(module);
    __kiwi_definingModule = module;
    run();
    __kiwi_definingModule = undefined;
}

function it(name, run) {
    let module = __kiwi_definingModule;

    try {
        throw new Error();
    } catch (e) {

        // let trace = __kiwi_extractTrace(e.stack, 2);
        if (module) {
            module.tests.push({ name, rawStack: e.stack, run, error: undefined, consoleLogs: [] });
        }
    }
}

if (typeof 'global' !== undefined) {
    global.describe = describe;
    global.it = it;
}
