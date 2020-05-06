from dataclasses import dataclass
from dataclasses_json import dataclass_json
from py_ts_interfaces import Interface
from typing import List


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
