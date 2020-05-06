import { computeLocationLists } from './actions';
import { TestModule, TestResult } from './runner';
import { expect } from 'chai';

let mockTests: TestResult[] = [
    { name: 'succ1', trace: { source: '/tmp/a', line: 10, column: 1 },
        consoleLogs: [], coveredFiles: { '/tmp/c': { 15: true } } },
    { name: 'fail1', trace: { source: '/tmp/b', line: 20, column: 1 },
		error: { message: 'wrong', trace: { source: '/tmp/b', line: 25, column: 1} },
        consoleLogs: [], coveredFiles: { '/tmp/d': { 25: true } } },
];

let mockFileLengths = { '/tmp/c': 5, '/tmp/d': 10 };

let mockModules: TestModule[] = [{ name: 'mod1', tests: mockTests }];

expect({ a: 1 }).to.eql({ a: 1 });

let { failed_tests, all_tests, all_test_files, all_covered_non_test_files } = computeLocationLists(mockModules, mockFileLengths);

// #SPC-actions.tst-list_failed_tests
expect(failed_tests).to.eql([{ file: '/tmp/b', line: 25, message: 'fail1 - wrong' }]);

// #SPC-actions.tst-list_all_tests
expect(all_tests).to.eql([
    { file: '/tmp/a', line: 10, message: 'succ1' },
    { file: '/tmp/b', line: 20, message: 'fail1' }]);
        
// #SPC-actions.tst-list_all_test_files
expect(all_test_files).to.eql([
    // jump to the line number of the first failing test - if there is any
    // also sort the files by those that have the most failing tests first
    { file: '/tmp/b', line: 25, message: '0/1 - wrong', pass: 0, fail: 1 },
    { file: '/tmp/a', line: 1, message: '1/0', pass: 1, fail: 0 } ]);
        
// #SPC-actions.tst-list_all_covered_non_test_files
expect(all_covered_non_test_files).to.eql([
    { file: '/tmp/d', line: 25, message: '[10%] 0/1 - wrong', pass: 0, fail: 1, coveragePercent: 10 },
    { file: '/tmp/c', line: 1, message: '[20%] 1/0', pass: 1, fail: 0, coveragePercent: 20 }]);
