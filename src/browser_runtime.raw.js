let __kiwi_testModules = [];
let __kiwi_definingModule;

let __kiwi_currentModule = 0;
let __kiwi_currentTest = 0;

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

async function __kiwi_runNextTest() {
    let module = __kiwi_testModules[__kiwi_currentModule];

    // No modules defined
    if (!module) return '[]';

    let test = module.tests[__kiwi_currentTest];

    // No tests defined
    if (!test) return '[]';

    __kiwi_runningTest = test;

    // #SPC-runner.errors
    try {
        await test.run();
    } catch(e) {
        if (e instanceof Error) {
            // trace: __kiwi_extractTrace(e.stack, 1), 
            test.error = { message: e.message, rawStack: e.stack };
        } else {
            // The thrown value is not a real error and does not have a stack trace
            test.error = { message: e.toString(), notErrorInstance: true };
        }
    }

    __kiwi_currentTest++;

    if( !module.tests[__kiwi_currentTest]) {
        __kiwi_currentTest = 0;
        __kiwi_currentModule++;
    }

    if( !__kiwi_testModules[__kiwi_currentModule]) {
        let modules = __kiwi_testModules.concat();
        __kiwi_currentModule = 0;
        __kiwi_testModules = [];
        return JSON.stringify(modules);
    }

    return JSON.stringify(false);
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

