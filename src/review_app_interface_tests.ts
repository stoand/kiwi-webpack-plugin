import { TestModule, TestResult } from './runner';
import { computeReviewAppTestResults } from './review_app_interface';
import { expect } from 'chai';

let testFile1 = (process.env.HOME || '') + '/t1'; 
let testFileHomeRelative1 = '~/t1';

let nonTestFile1 = (process.env.HOME || '') + '/f1';
let nonTestFileHomeRelative1 = '~/f1';

let mockTests: TestResult[] = [
    { name: 'succ1', trace: { source: testFile1, line: 10, column: 1 },
        consoleLogs: [], coveredFiles: { [testFile1]: { 1: true }, [nonTestFile1]: { 15: true } } },
    { name: 'fail1', trace: { source: '/tmp/b', line: 20, column: 1 },
		error: { message: 'wrong', trace: { source: '/tmp/b', line: 25, column: 1} },
        consoleLogs: [], coveredFiles: { '/tmp/d': { 35: true } } },
];

let mockFileLengths = { [nonTestFile1]: 5, '/tmp/d': 10 };

let mockModules: TestModule[] = [{ name: 'mod1', tests: mockTests }];

let testResults = computeReviewAppTestResults({ modules: mockModules, initialCoverage: {}, fileLengths: mockFileLengths });

let { aggregations, test_files, covered_files } = testResults;
