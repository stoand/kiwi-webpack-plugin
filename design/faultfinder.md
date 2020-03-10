# SPC-faultfinder
partof: REQ-purpose
###

The faultfinder's primary and most obvious usecase
is to combine runtime coverage and test status data
to essentially find what areas of the code are involved in failing tests.

A line of code can have one of the following states:
* No indicator - it was not covered in any tests
* Red indicator - it was covered in one or more failing tests
* Yellow indicator - if only certain blocks were covered by tests; all succeeding
* Green indicator - it was covered in one or more tests; all succeeding
