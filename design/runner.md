# SPC-runner
partof: REQ-purpose
###

The runner is responsible for executing javascript
while extracting coverage information.

Key innovation:

The runner employs a modified v8 (nodejs) executable

that instead of simply outputting the coverage of an entire run,

will measure code coverage of multiple test functions at once.

Test functions are identified with a special `__kiwi_tid=<random_number>` property.

The outputted coverage file will not have a single results file list, but an hashmap of result

files lists belonging to every unique `__kiwi_tid` on the test functions.



Relevant source files in the nodejs source:
* src/inspector_profiler.cc
