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
            __kiwi_runningTest.consoleLogs.push({ args, trace: __kiwi_extractTrace(e.stack, 2) });
        }
    }

    __kiwi_oldConsoleLog(...args);
}

function __kiwi_extractTrace(stack, row) {
    let parts = stack.split('\n')[row].slice(-50).split(':');
    let line = Number(parts[parts.length - 2]);
    let column = Number(parts[parts.length - 1].replace(')', ''));
    return { column, line };
}

async function __kiwi_runNextTest() {
    let module = __kiwi_testModules[__kiwi_currentModule];

    // No modules defined
    if (!module) return false;

    let test = module.tests[__kiwi_currentTest];

    // No tests defined
    if (!test) return false;

    __kiwi_runningTest = test;

    // #SPC-runner.errors
    try {
        await test.run();
    } catch( e) {
        test.error = { message: e.message, trace: __kiwi_extractTrace(e.stack, 1) };
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
        let trace = __kiwi_extractTrace(e.stack, 2);

        if (module) {
            module.tests.push({ name, trace, run, error: undefined, consoleLogs: [] });
        }
    }
}

