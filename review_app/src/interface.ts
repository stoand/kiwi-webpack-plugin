// Generated using py-ts-interfaces.
// See https://github.com/cs-cordero/py-ts-interfaces

interface Aggregations {
    total_coverage_percent: number;
    total_passed: number;
    total_failed: number;
}

interface StackTraceItem {
    file_path: string;
    line: number;
    column: number;
}

interface Test {
    name: string;
    line: number;
    success: boolean;
    stacktrace: Array<StackTraceItem>;
}

interface TestModule {
    name: string;
    tests: Array<Test>;
}

interface TestFile {
    file_path: string;
    modules: Array<TestModule>;
}

interface CoveredFile {
    file_path: string;
    coverage_percent: number;
}

interface TestResults {
    aggregations: Aggregations;
    test_files: Array<TestFile>;
    covered_files: Array<CoveredFile>;
}