import { computeLocationLists, computeLineStatuses } from './actions';
import { TestModule, TestResult } from './runner';
import { expect } from 'chai';

describe('Location List Computation', () => {

    let testFile1 = (process.env.HOME || '') + '/t1'; 
    let testFileHomeRelative1 = '~/t1';

    let nonTestFile1 = (process.env.HOME || '') + '/f1';
    let nonTestFileHomeRelative1 = '~/f1';

    let mockTests: TestResult[] = [
        { name: 'succ1', trace: { source: testFile1, line: 10, column: 1 }, rawStack: '', stack: [],
            consoleLogs: [], coveredFiles: { [testFile1]: { 1: true }, [nonTestFile1]: { 15: true } } },
        { name: 'fail1', trace: { source: '/tmp/b', line: 20, column: 1 }, rawStack: '', stack: [], 
    		error: { rawStack: '', stack: [], message: 'wrong', trace: { source: '/tmp/b', line: 25, column: 1} },
            consoleLogs: [], coveredFiles: { '/tmp/d': { 35: true } } },
    ];

    let mockFileLengths = { [nonTestFile1]: 5, '/tmp/d': 10 };

    let mockModules: TestModule[] = [{ name: 'mod1', tests: mockTests }];

    let { failed_tests, all_tests, all_test_files, all_covered_non_test_files } = computeLocationLists(mockModules, mockFileLengths);

    it('can compute failed test list', () => {
        // #SPC-actions.tst-list_failed_tests
        expect(failed_tests).to.eql([{ file: '/tmp/b', line: 25, message: 'fail1 - wrong' }]);
    });


    it('can compute a list of all tests', () => {
        // #SPC-actions.tst-list_all_tests
        expect(all_tests).to.eql([
            { file: testFileHomeRelative1, line: 10, message: 'succ1' },
            { file: '/tmp/b', line: 20, message: 'fail1' }]);
    });

    it('can compute a list of all test files', () => {
        // #SPC-actions.tst-list_all_test_files
        expect(all_test_files).to.eql([
            // jump to the line number of the first failing test - if there is any
            // also sort the files by those that have the most failing tests first
            { file: '/tmp/b', line: 25, message: '0/1 - wrong', pass: 0, fail: 1 },
            { file: testFileHomeRelative1, line: 1, message: '1/0', pass: 1, fail: 0 } ]);
    });

    it('can compute a list of non-test files', () => {
        // #SPC-actions.tst-list_all_covered_non_test_files
        expect(all_covered_non_test_files).to.eql([
            { file: '/tmp/d', line: 35, message: '[10%] 0/1 - wrong', pass: 0, fail: 1, coveragePercent: 10 },
            { file: nonTestFileHomeRelative1, line: 1, message: '[20%] 1/0', pass: 1, fail: 0, coveragePercent: 20 }]);
    });
});

describe('Line Status Computation', () => {

    let runs: any = [
        { coverage: { 'file1': { 1: true } }, success: true },
        { coverage: { 'file1': { 2: true } }, success: true },
        { coverage: {}, success: true }, 
        { coverage: { 'file1': { 1: true } }, success: false },
    ];

    let fileStatuses = computeLineStatuses(runs);

    it('coverage of failing tests takes precedence', () => {
        expect(fileStatuses['file1'][0]).to.eql('fail');
    });
});
