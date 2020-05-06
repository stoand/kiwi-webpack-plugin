import { TestModule, TestResult } from './runner';
import { computeReviewAppTestResults } from './review_app_interface';
import { expect } from 'chai';

let testFile1 = (process.env.HOME || '') + '/t1'; 
let testFileHomeRelative1 = '~/t1';

let nonTestFile1 = (process.env.HOME || '') + '/f1';
let nonTestFileHomeRelative1 = '~/f1';

let mockTests1: TestResult[] = [
    { name: 'succ1', trace: { source: testFile1, line: 10, column: 1 },
        consoleLogs: [], coveredFiles: { [testFile1]: { 1: true }, [nonTestFile1]: { 15: true } } },
];

let mockTests2: TestResult[] = [
    { name: 'fail1', trace: { source: '/tmp/b', line: 20, column: 1 },
		error: { message: 'wrong', trace: { source: '/tmp/b', line: 25, column: 1} },
        consoleLogs: [], coveredFiles: { '/tmp/d': { 35: true } } },
];

let mockFileLengths = { [nonTestFile1]: 5, '/tmp/d': 10 };

let mockModules: TestModule[] = [{ name: 'mod1', tests: mockTests1 }, { name: 'mod2', tests: mockTests2 }];

let testResults = computeReviewAppTestResults({ modules: mockModules, initialCoverage: {}, fileLengths: mockFileLengths });

let { aggregations, test_files, covered_files } = testResults;

// TODO
// expect(aggregations).to.eql({
//     total_coverage_percent: 80,
//     total_passed: 80,
//     total_failed: 80,
// });

// console.log(test_files[1])
// console.log(test_files[1].modules[0])

expect(test_files).to.eql([
   { file_path: testFileHomeRelative1, modules: [{ name: 'mod1',
   	 tests: [ { name: 'succ1', line: 10, success: true, stacktrace: [] } ] } ] }, 
   { file_path: '/tmp/b', modules: [{ name: 'mod2',
   	 tests: [ { name: 'fail1', line: 20, success: false, stacktrace: [] } ] } ] } 
]);
