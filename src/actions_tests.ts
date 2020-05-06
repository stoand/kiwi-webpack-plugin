import { computeLocationLists } from './actions';
import { TestModule, TestResult } from './runner';
import { expect } from 'chai';

let mockTests: TestResult[] = [
    { name: 'succ1', trace: { source: '/tmp/a', line: 10, column: 1 }, consoleLogs: [], coveredFiles: {} },
    { name: 'fail1', trace: { source: '/tmp/b', line: 20, column: 1 },
		error: { message: 'wrong', trace: { source: '/tmp/b', line: 25, column: 1} },
        consoleLogs: [], coveredFiles: {} },
];

let mockModules: TestModule[] = [{ name: 'mod1', tests: mockTests }];

expect({ a: 1 }).to.eql({ a: 1 });

let { failed_tests, all_tests } = computeLocationLists(mockModules);

// #SPC-actions.tst-list_failed_tests
expect(failed_tests).to.eql([{ file: '/tmp/b', line: 25, message: 'fail1 - wrong' }]);

// #SPC-actions.tst-list_all_tests
expect(all_tests).to.eql([
    { file: '/tmp/a', line: 10, message: 'succ1' },
    { file: '/tmp/b', line: 20, message: 'fail1' }]);
