from dataclasses import dataclass
from dataclasses_json import dataclass_json
from py_ts_interfaces import Interface
from typing import List

# Do not edit this class definition unless
# the format of the `review_app/kiwi_test_results.json` file has also changed

# The `review_app/src/interface.ts` file will
# have to be regenerated when this file changes (see spec)


@dataclass
class Aggregations(Interface):
    total_coverage_percent: int
    total_passed: int
    total_failed: int


@dataclass
class StackTraceItem(Interface):
    file_path: str
    line: int
    column: int


@dataclass
class Test(Interface):
    name: str
    line: int
    success: bool
    error_message: str
    stacktrace: List[StackTraceItem]


@dataclass
class TestModule(Interface):
    name: str
    tests: List[Test]


@dataclass
class TestFile(Interface):
    file_path: str
    modules: List[TestModule]


@dataclass
class CoveredFile(Interface):
    file_path: str
    coverage_percent: int


@dataclass_json
@dataclass
class TestResults(Interface):
    aggregations: Aggregations
    test_files: List[TestFile]
    covered_files: List[CoveredFile]
