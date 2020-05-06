import { RunResult, TestModule, CoveredFiles } from './runner';
import { init_highlighters, recreateTmpDir, add_location_list_command, line_notifications,
        	line_statuses, running_instances, FileLabels, FileStatuses, Location } from './kakoune_interface';

const scanInterval = 350;

let prevScanner: NodeJS.Timeout;

export default function handleTestRun(runResult: RunResult) {

    let { modules, initialCoverage } = runResult;

    runActions(modules, initialCoverage);

    // disable the scanner from the previous call to this function
    // the entire editor state is updated by every call
    if (prevScanner) {
        clearInterval(prevScanner);
    }

    // If new kakoune editors are opened perform actions on them
    let knownInstances = 0;

    prevScanner = setInterval(() => {
        let instanceCount = running_instances().length;

        if (instanceCount > knownInstances) {
            // New instance detected
            runActions(modules, initialCoverage);
        }

        knownInstances = instanceCount;

    }, scanInterval);
}

export function runActions(modules: TestModule[], initialCoverage: CoveredFiles) {
    recreateTmpDir();

	init_highlighters();

    setLineStatuses(modules, initialCoverage);
        
    setNotifications(modules);

    addListCommands(modules);
}

// #SPC-actions.set_line_statuses
function setLineStatuses(modules: TestModule[], initialCoverage: CoveredFiles) {

    let fileStatuses: FileStatuses = {};

    let handleCoverage = (coverage: CoveredFiles, success: boolean) => {
        for (let filePath in coverage) {
            if (!fileStatuses[filePath]) fileStatuses[filePath] = {};
            let file = coverage[filePath];
            for (let line in file) {
                let covered = file[line];
                let state = fileStatuses[filePath][Number(line) - 1];

				if (covered) {
                    if (!success) {
                        state = 'fail';
                    } else if (state == 'uncovered' || !state) {
                        state = 'success';
                    }
                } else {
                    if (!state) {
                        state = 'uncovered';
                    }
                }
                        
                fileStatuses[filePath][Number(line) - 1] = state;
            }
        }
    }

    handleCoverage(initialCoverage, true);

    for (let module of modules) {
        for (let test of module.tests) {
            handleCoverage(test.coveredFiles, test.error == undefined);
        }
    }


    line_statuses(fileStatuses);
}

// #SPC-actions.set_notifications
function setNotifications(modules: TestModule[]) {

    let files: FileLabels = {};

    modules.forEach(module => {
        module.tests.forEach(test => {
            test.consoleLogs.forEach(log => {
                files[log.trace.source] = files[log.trace.source] || {};
                let existing = files[log.trace.source][log.trace.line]?.text;
                let joinedArgs = log.args.join(', ');
                let text = existing ? existing + ', ' + joinedArgs : joinedArgs;
                files[log.trace.source][log.trace.line] = { text, color: 'normal' };
            });

            if (test.error) {
                files[test.error.trace.source] = files[test.error.trace.source] || {};
                files[test.error.trace.source][test.error.trace.line] = { text: test.error.message, color: 'error' };
            }
        });
    });

    line_notifications(files);
}

function addListCommands(modules: TestModule[]) {
    
    let failedTests = [];


    for (let mod of modules) {
        for (let test of mod.tests) {
            if (test.error) {
                let errorFile = test.error.trace.source;
                let errorLine = test.error.trace.line;
                failedTests.push({ file: errorFile, line: errorLine, message: test.error.message });
            }
        }
    }


    // #SPC-actions.list_failed_tests
    add_location_list_command('failed_tests', failedTests);
}
