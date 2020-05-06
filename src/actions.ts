import { RunResult, TestModule, CoveredFiles, TestError } from './runner';
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
    let allTests = [];
    let testFiles: { [file: string]: { pass: number, fail: number, firstError?: TestError } } = { };

	let resolveTilde = (src: string) => {
    	let homeDir = process.env.HOME;
    	if (homeDir && src.indexOf(homeDir) == 0) {
        	return src.replace(homeDir, '~');
    	} else {
        	return src;
    	}
	};

    for (let mod of modules) {
        for (let test of mod.tests) {
            let testFile = resolveTilde(test.trace.source);
            let testLine = test.trace.line;

            allTests.push({ file: testFile, line: testLine, message: test.name });
            testFiles[testFile] = testFiles[testFile] || { pass: 0, fail: 0 };
            
            if (test.error) {
                testFiles[testFile].fail++;
                
                if (!testFiles[testFile].firstError) {
                    testFiles[testFile].firstError = test.error;
                }
            } else {
                testFiles[testFile].pass++;
            }
            
            if (test.error) {
                let errorFile = resolveTilde(test.error.trace.source);
                let errorLine = test.error.trace.line;
                let message = `${test.name} - ${test.error.message}`;
                failedTests.push({ file: errorFile, line: errorLine, message });
            }
        }
    }
    
    let testFileLocations: (Location & { pass: number, fail: number })[] = [];
    for (let testFile of Object.keys(testFiles)) {
        let { pass, fail, firstError } = testFiles[testFile];
        let message = `${pass}/${fail}`;
        let line = 1;

		if (firstError) {
    		message = message + ' - ' + firstError.message;
    		line = firstError.trace.line;
		}
        
        testFileLocations.push({ file: testFile, line, message, pass, fail });
    }

    // sort by number of failing tests, file name
    testFileLocations.sort((l1, l2) => l1.file > l2.file ? 1 : -1);
    testFileLocations.sort((l1, l2) => l1.fail > l2.fail ? 1 : -1);

    // #SPC-actions.list_failed_tests
    add_location_list_command('failed_tests', failedTests);
    // #SPC-actions.list_all_tests
    add_location_list_command('all_tests', allTests);
    // #SPC-actions.list_all_test_files
    add_location_list_command('all_test_files', testFileLocations);
}
