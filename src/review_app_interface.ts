// #SPC-review_app.interface
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
import { resolveTilde } from './actions';
import { RunResult, FileCoverage } from './runner';
import '../review_app/src/interface';

const reviewAppDir = path.resolve(process.cwd(), 'node_modules/kiwi-webpack-plugin/review_app');
const startScriptName = 'start.sh';
const resultFileName = 'kiwi_test_results.json';

export function startReviewApp() {
    // Try to run the review app
    try {
        let reviewApp = spawn('bash', ['-e', path.resolve(reviewAppDir, startScriptName)]);

        reviewApp.stderr.on('data', (data: any) => console.error(data.toString()));
        reviewApp.stdout.on('data', (data: any) => console.log(data.toString()));
    } catch (e) {
        console.error(e);
    }
}

export function computeReviewAppTestResults(runResult: RunResult): TestResults {

    let { modules, fileLengths } = runResult;

	let testFiles: TestFile[] = [];
	let coveredFiles: (CoveredFile & { coverage: FileCoverage })[]= [];

	let passed = 0;
	let failed = 0;
	
	for (let mod of modules) {
    	for (let test of mod.tests) {
        	let source = test.trace.source;

        	// try to find existing test file
        	// if it does not exist create it
        	let testFile = testFiles.find(tf => tf.source == source);
        	if (!testFile) {
            	testFile = { source, modules: [] };
            	testFiles.push(testFile);
        	}

        	// try to find existing test file module
        	// if it does not exist create it
        	let testFileModule = testFile.modules.find(m => m.name == mod.name);
        	if (!testFileModule) {
            	testFileModule = { name: mod.name, tests: [] };
            	testFile.modules.push(testFileModule);
        	}

        	if (test.error) {
            	failed++;
        	} else {
            	passed++;
        	}

        	testFileModule.tests.push({ name: test.name, line: test.trace.line, success: !test.error,
        		error_message: test.error?.message || '', stacktrace: test.stack });

        	for (let covered in test.coveredFiles) {
            	let coveredFile = coveredFiles.find(cf => cf.source == covered);
            	if (!coveredFile) {
                	coveredFile = { source: covered, coverage_percent: 0, coverage: {} };
                	coveredFiles.push(coveredFile);
            	}

            	for (let line in test.coveredFiles[covered]) {
                	if (test.coveredFiles[covered][line]) {
                    	coveredFile.coverage[line] = true;
                	}
            	}
        	}
    	}
	}

	// Try to replace the home path with a tilde to save path length

	for (let testFile of testFiles) {
    	testFile.source = resolveTilde(testFile.source);
	}

	let totalCoveredLines = 0;
	let totalLines = 0;

	let computePercent = (v: number) => Math.floor(v * 100);
	
	for (let coveredFile of coveredFiles) {
    	let len = fileLengths[coveredFile.source];
    	totalLines += len;
    	coveredFile.source = resolveTilde(coveredFile.source);
    	let coveredLines = Object.keys(coveredFile.coverage).length;
    	totalCoveredLines += coveredLines;
    	coveredFile.coverage_percent = computePercent(coveredLines / len);
    	delete coveredFile.coverage;
	}

	let totalCoverage = computePercent(totalCoveredLines / totalLines);
    
    return {
        aggregations: {
            total_coverage_percent: totalCoverage,
            total_passed: passed,
            total_failed: failed,
        },
        test_files: testFiles,
        covered_files: coveredFiles,
    };
}

export function updateReviewAppDataSource(runResult: RunResult) {
    let resultFilePath = path.resolve(reviewAppDir, resultFileName);

    fs.writeFile(resultFilePath, JSON.stringify(computeReviewAppTestResults(runResult)), (err: any) => {
        if (err) {
            console.error(err);
        }
    });
}
