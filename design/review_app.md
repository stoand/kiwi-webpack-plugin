# SPC-review_app

## [[.interface]]

On every test run, [[SPC-webpack_plugin]] will write test results to: `kiwi_test_results.json`.

Additionally, it will setup the virtualenv and run the python server on port `8096` through `review_app/start.sh`.

## [[.status_bar]]

Gives a high-level overview of test results.

Displays the following statistics:
* Total file coverage percentage
* Number of failed tests
* Number of sucessful tests


## [[.file_overview]] 

Displays an alphabetically ordered list of files that contain tests.
Each test file has a list of test modules and tests that are kept in the order they ran.

Succeeding tests are displayed in green, failing tests in red.

Files and modules that contain failing tests are displayed in red colored text.
Otherwise they are displayed in green.

In the format:

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
      
src/folder_c/folder_d/yet_test_another_file.js
	...
