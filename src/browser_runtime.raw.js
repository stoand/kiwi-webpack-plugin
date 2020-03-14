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
    let column = Number(parts[parts.length - 1].slice(0, -1));
    return { column, line };
}

function __kiwi_runNextTest() {
    let module = __kiwi_testModules[__kiwi_currentModule];
    if (!module) {
        let modules = __kiwi_testModules.concat();
        __kiwi_currentModule = 0;
        __kiwi_testModules = [];
        return modules;
        
    } else {
        let test = module.tests[__kiwi_currentTest];

        __kiwi_runningTest = test;
        
        if (!test) {
            __kiwi_currentTest = 0;
            __kiwi_currentModule++;
            
        } else {
            // #SPC-runner.errors
            try {
                test.run();
            } catch(e) {
                test.error = { message: e.message, trace: __kiwi_extractTrace(e.stack, 1) };
            }
            
            __kiwi_currentTest++;
        }
    }

    return false;
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
    
    if (module) {
        module.tests.push({ name, run, error: undefined, consoleLogs: [] });
    }
}

