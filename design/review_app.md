# SPC-review_app
partof: REQ-purpose
###

## [[.interface]]

On startup [[SPC-webpack_plugin]] will setup the virtualenv and
run the python server on port `8096` through `review_app/start.sh`.

On every test run, it will write test results to: `review_app/kiwi_test_results.json`.

## [[.status_bar]]

Gives a high-level overview of test results.

Displays the following statistics:
* Total file coverage percentage
* Number of failed tests
* Number of sucessful tests


## [[.test_file_overview]] 

Page is named "Test Files".

Displays a list of files that contain tests.

Each test file has a list of test modules and tests are kept in the order they ran.

Succeeding tests are displayed in green, failing tests in red.

Files and modules that contain failing tests are displayed in red.
Otherwise they are displayed in green.

User-selectable orderings:
* most failing test count to least
* least failing test count to most
* alphabetically (default)

The format:

```
<red>src/folder_a/some_test_file.js
  <red> Some Test Module
      <green> Succeeding Test 
      <red> Failing Test
	  
  <green> Another Test Module
      <green> Another succeeding test 

<green>src/folder_b/another_test_file.js
  <green> Yet Another Test Module
      <green> Yet Another succeeding test 
```

## [[.file_coverage]]

Page is named "Covered Files".

This page displays the coverage of non-test files.

User-selectable orderings:
* least coverage to most
* most coverage to least
* alphabetically (default)

The format:

```
src/folder_a/some_regular_file.js               <red>    0% 
src/folder_b/some_other_regular_file.js	        <green> 92% 
src/folder_b/some_other_regular_file2.js        <red>    0% 
```

Percentage background color:
* Green 90% coverage or more
* Yellow-Orangish 60% coverage or more
* Red
