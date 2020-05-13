import { TestModule, TestResult } from './runner';
import { computeReviewAppTestResults } from './review_app_interface';
import { expect } from 'chai';

let testFile1 = (process.env.HOME || '') + '/t1'; 
let testFileHomeRelative1 = '~/t1';

let nonTestFile1 = (process.env.HOME || '') + '/f1';
let nonTestFileHomeRelative1 = '~/f1';

let mockTests1: TestResult[] = [
    { name: 'succ1', trace: { source: testFile1, line: 10, column: 1 }, rawStack: '', stack: [],
        consoleLogs: [], coveredFiles: { [testFile1]: { 1: true }, [nonTestFile1]: { 15: true } } },
];

let mockTests2: TestResult[] = [
    { name: 'fail1', trace: { source: '/tmp/b', line: 20, column: 1 }, rawStack: '', stack: [],
		error: { rawStack: '', message: 'wrong', stack: [], trace: { source: '/tmp/b', line: 25, column: 1 } },
        consoleLogs: [], coveredFiles: { '/tmp/d': { 35: true } } },
];

let mockFileLengths = { [testFile1]: 20, [nonTestFile1]: 5, '/tmp/d': 10 };

let mockModules: TestModule[] = [{ name: 'mod1', tests: mockTests1 }, { name: 'mod2', tests: mockTests2 }];

describe('Review App', () => {

    let testResults = computeReviewAppTestResults({ modules: mockModules, fileLengths: mockFileLengths });

    let { aggregations, test_files, covered_files } = testResults;

    it('can compute aggregations correctly', () => {
        expect(aggregations).to.eql({
            total_coverage_percent: 13,
            total_passed: 1,
            total_failed: 1,
        });
    });

    it('can compute test files correctly', () => {
        expect(test_files).to.eql([
           { source: testFileHomeRelative1, modules: [{ name: 'mod1',
           	 tests: [ { name: 'succ1', line: 10, success: true, error_message: '', stacktrace: [] } ] } ] }, 
           { source: '/tmp/b', modules: [{ name: 'mod2',
           	 tests: [ { name: 'fail1', line: 20, success: false, error_message: 'wrong', stacktrace: [] } ] } ] } 
        ]);
    });

    it('can compute covered files correctly', () => {
        expect(covered_files).to.eql([
            { source: nonTestFileHomeRelative1, coverage_percent: 20 },
            { source: '/tmp/d', coverage_percent: 10 },
        ]);
    });
});

