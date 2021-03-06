import { RunResult, TestModule, CoveredFiles, TestError, FileLengths, FileCoverage } from './runner';
import { init_highlighters, createTmpDir, add_location_list_command, line_notifications, register_full_notifications,
        	line_statuses, running_instances, FileLabels, FileStatuses, FullNotification, Location } from './kakoune_interface';
import { inspect } from 'util';

export type LocationLists = {
    failed_tests: Location[],
    all_tests: Location[],
    all_test_files: Location[],
    all_covered_non_test_files: Location[],
}

const scanInterval = 350;

const maxNotifications = 1000;

let prevScanner: NodeJS.Timeout;

export default function handleTestRun(runResult: RunResult) {

    runActions(runResult);

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
            runActions(runResult);
        }

        knownInstances = instanceCount;

    }, scanInterval);
}

export function runActions(runResult: RunResult) {
    let { modules, fileLengths } = runResult;
    
    createTmpDir();

	init_highlighters();

    setLineStatuses(modules);
        
    setNotifications(modules);

    addListCommands(modules, fileLengths);
}

export function computeLineStatuses(runs: ({coverage: CoveredFiles, success: boolean})[]) {
  
    let fileStatuses: FileStatuses = {};

    for (let run of runs) {
        let { coverage, success } = run;
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

    return fileStatuses;
}

// #SPC-actions.set_line_statuses
function setLineStatuses(modules: TestModule[]) {

	let testCoverages = [];
	
    for (let module of modules) {
        for (let test of module.tests) {
            testCoverages.push({ coverage: test.coveredFiles, success: test.error == undefined });
        }
    }
    
    let fileStatuses = computeLineStatuses(testCoverages);
    
    return line_statuses(fileStatuses);
}

function formatJsonMultiline(items: any[]) {
    let jsonItems = items.length == 1 ? items[0] : items;
    return inspect(jsonItems, { compact: false, depth: 10, breakLength: 80 });
}

function formatJsonSingleLine(item: any) {
    return inspect(item, { compact: true, depth: 3 });
}

// #SPC-actions.set_notifications
function setNotifications(modules: TestModule[]) {

    let files: FileLabels = {};

    let notificationFiles: FullNotification[] = [];

    modules.forEach(module => {
        module.tests.forEach(test => {
            test.consoleLogs.forEach(log => {
                files[log.trace.source] = files[log.trace.source] || {};
                let existing = files[log.trace.source][log.trace.line]?.text;
                let joinedArgs = log.args.map(formatJsonSingleLine).join(', ');
                let text = existing ? existing + ', ' + joinedArgs : joinedArgs;
                files[log.trace.source][log.trace.line] = { text, color: 'normal' };

                notificationFiles.push({ file: log.trace.source, line: log.trace.line, json: formatJsonMultiline(log.args) });
            });

            if (test.error) {
                // Display errors higher up in the stack as well - not just in the immediate file
                for (let loc of test.error.stack) {
                    files[loc.source] = files[loc.source] || {};
                    files[loc.source][loc.line] = { text: test.error.message, color: 'error' };

                    let json = test.error.message;
                    
                    let assertionError : any = test.error;
                    if (assertionError.expected && assertionError.actual) {
                        json = formatJsonMultiline([{ expected: assertionError.expected, actual: assertionError.actual }]);
                    }
                    
                    notificationFiles.push({ file: loc.source, line: loc.line, json });
                }
            }
        });
    });

    notificationFiles = notificationFiles.filter((_, index) => index < maxNotifications);

    let locations = notificationFiles.map(notification =>
        ({ file: notification.file, line: notification.line, message: notification.json }));

    line_notifications(files);

    register_full_notifications(notificationFiles);

    // #SPC-actions.list_notifications
    add_location_list_command('notifications', locations, true);
}

export function resolveTilde(src: string) {
	let homeDir = process.env.HOME;
	if (homeDir && src.indexOf(homeDir) == 0) {
    	return src.replace(homeDir, '~');
	} else {
    	return src;
	}
}

export function computeLocationLists(modules: TestModule[], fileLengths: FileLengths): LocationLists {
    
    let failedTests = [];
    let allTests = [];
    let testFiles: { [file: string]: { pass: number, fail: number, firstError?: TestError } } = { };
    let nonTestFiles: { [file: string]: { pass: number, fail: number,
    	firstError?: TestError, firstFailContribLine?: number, fileCoverage: FileCoverage } } = { };

    for (let mod of modules) {
        for (let test of mod.tests) {
            let testFile = test.trace.source;
            let testLine = test.trace.line;

            allTests.push({ file: resolveTilde(testFile), line: testLine, message: test.name });
            testFiles[testFile] = testFiles[testFile] || { pass: 0, fail: 0 };

            // Handle Tests
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

			// Handle files covered by tests
            for (let coveredFile in test.coveredFiles) {
                nonTestFiles[coveredFile] = nonTestFiles[coveredFile] || { pass: 0, fail: 0, fileCoverage: {} };
                let nonTestFile = nonTestFiles[coveredFile];

				let firstContribLine: number | undefined;
                for (let line in test.coveredFiles[coveredFile]) {
                    if(test.coveredFiles[coveredFile][line]) {
                        nonTestFile.fileCoverage[line] = true;

                        let lineNumber = Number(line);
                        if (firstContribLine) {
                            firstContribLine = Math.min(firstContribLine, lineNumber);
                        } else {
                            firstContribLine = lineNumber;
                        }
                    }
                }

                if (Object.values(test.coveredFiles[coveredFile]).find(v => v === true)) {
                    if (test.error) {
                        nonTestFile.fail++;
                        if (!nonTestFile.firstError) {
                            nonTestFile.firstError = test.error;
                            nonTestFile.firstFailContribLine = firstContribLine;
                        }
                    } else {
                        nonTestFile.pass++;
                    }
                }
            }
        }
    }

    type LocWithCounts = Location & { pass: number, fail: number };
    type LocWithCountsAndCoverage = Location & { pass: number, fail: number, coveragePercent: number }
    
    let testFileLocations: LocWithCounts[] = [];
    for (let testFile in testFiles) {
        let { pass, fail, firstError } = testFiles[testFile];
        let message = `${pass}/${fail}`;
        let line = 1;

		if (firstError) {
    		message = message + ' - ' + firstError.message;
    		line = firstError.trace.line;
		}
        
        testFileLocations.push({ file: resolveTilde(testFile), line, message, pass, fail });
    }

    // sort by number of failing tests, file name
    testFileLocations.sort((l1, l2) => l1.file < l2.file ? 1 : -1);
    testFileLocations.sort((l1, l2) => l1.fail < l2.fail ? 1 : -1);

    let nonTestFileLocations: LocWithCountsAndCoverage[] = [];
    // Remove files with tests in them from the non-test files
    for (let testFile in testFiles) {
        if (nonTestFiles[testFile]) {
            delete nonTestFiles[testFile];
        }
    }

    for (let nonTestFile in nonTestFiles) {
        let { pass, fail, firstError, firstFailContribLine, fileCoverage } = nonTestFiles[nonTestFile];
        let coveragePercent = Math.floor(Object.keys(fileCoverage).length / fileLengths[nonTestFile] * 100);
        let message = `[${coveragePercent}%] ${pass}/${fail}`;
        let line = 1;

        if (firstError && firstFailContribLine) {
            message = message + ' - ' + firstError.message;
            line = firstFailContribLine;
        }

        nonTestFileLocations.push({ file: resolveTilde(nonTestFile), line, message, pass, fail, coveragePercent });
    }

    // sort by number of failing tests, coverage, file name
    nonTestFileLocations.sort((l1, l2) => l1.file < l2.file ? 1 : -1);
    nonTestFileLocations.sort((l1, l2) => l1.coveragePercent > l2.coveragePercent ? 1 : -1);
    nonTestFileLocations.sort((l1, l2) => l1.fail < l2.fail ? 1 : -1);

	return {
        // #SPC-actions.list_failed_tests
    	failed_tests: failedTests,
        // #SPC-actions.list_all_tests
    	all_tests: allTests,
        // #SPC-actions.list_all_test_files
    	all_test_files: testFileLocations,
        // #SPC-actions.list_all_covered_non_test_files
    	all_covered_non_test_files: nonTestFileLocations,
	};
}

function addListCommands(modules: TestModule[], fileLengths: FileLengths) {
    let locationLists = computeLocationLists(modules, fileLengths);
    for (let locationListName in locationLists) {
        add_location_list_command(locationListName, (locationLists as any)[locationListName]);
    }
}
