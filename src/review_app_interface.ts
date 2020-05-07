// #SPC-review_app.interface
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
import { resolveTilde } from './actions';
import { RunResult } from './runner';
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
	let coveredFiles: CoveredFile[] = [];
	
	for (let mod of modules) {
    	for (let test of mod.tests) {
        	let file_path = test.trace.source;

        	// try to find existing test file
        	// if it does not exist create it
        	let testFile = testFiles.find(tf => tf.file_path == file_path);
        	if (!testFile) {
            	testFile = { file_path, modules: [] };
            	testFiles.push(testFile);
        	}

        	// try to find existing test file module
        	// if it does not exist create it
        	let testFileModule = testFile.modules.find(m => m.name == mod.name);
        	if (!testFileModule) {
            	testFileModule = { name: mod.name, tests: [] };
            	testFile.modules.push(testFileModule);
        	}

        	testFileModule.tests.push({ name: test.name, line: test.trace.line, success: !test.error,
        		error_message: test.error?.message || '', stacktrace: [] });
    	}
	}

	// Try to replace the home path with a tilde to save path length

	for (let testFile of testFiles) {
    	testFile.file_path = resolveTilde(testFile.file_path);
	}

	for (let coveredFile of coveredFiles) {
    	coveredFile.file_path = resolveTilde(coveredFile.file_path);
	}
    
    return {
        aggregations: {
            total_coverage_percent: 0,
            total_passed: 0,
            total_failed: 0,
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
