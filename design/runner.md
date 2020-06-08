# SPC-runner
partof: REQ-purpose
###

## [[.laucher_chrome]]

Instead of opting for mere browser api emulation, the runner
executes tests in a headless Chrome process.

https://gist.github.com/paulirish/78f46a302083dd757288b5fcc660d75c

[[.tst-launcher_chrome]]

Ensure the runner can communicate with a headless Chrome instance.

## [[.laucher_node]]

Starts a node process to evaluate tests.

This is much faster but some frontend apps will not work or
will need to have mocks added.

[[.tst-launcher_node]]

Ensure the runner can communicate with a NodeJS instance.

## [[.sourcemap]]

Since the coverage is ran on the compiled output,
we need source mapping to find out what scripts were originally run.

[[.tst_sourcemap]]

Ensure source maps work.

## [[.file_lengths]]

## [[.async]]

Support tests that run asynchronously.

If a test returns a promise wait for it.

Also handle errors returned by promises.

[[.tst-async_run]]

Ensure the runner can detect and wait for async tests to finish.

[[.tst-async_error]]

Ensure errors inside promises are handled correctly.

## [[.special_focus]]

If any test is marked as focused with `fit` instead of `it` only
the focused tests will run.

## [[.special_exclude]]

If a test is marked with `xit` instead of `it` it will be excluded.

## Possible Performance Improvements

Protocol functions to examine:

* setInstrumentationBreakpoint
* evaluateOnCallFrame

# Resulting Data

Takes the source code of compiled tests, runs them, and returns a list of modules.
Each module contains a list of tests and the following data for each test:

## [[.errors]]

A list of thrown errors and their
* content
* location - file and line

Note: this does not include `console.error`

[[.errors_build]]

Handle failing webpack build.

[[.tst-errors]]

## [[.logs]]

A list of `console.log`s and their
* content
* location - file and line

[[.tst-logs]]

[[.log_format]]

Log messages need to be formatted to avoid '[Object]' type values being displayed.

## [[.coverage]]

A list of files that ran while the test executed with a run count for every line.

[[.tst-coverage]]

Ensures that correct coverage information is
collected from multiple tests that were run.

[[.tst-coverage_association]]

When any test fails, all covered lines that ran previous to it should
be marked as contributing to a failure.

## [[.bug_stops_responding]]

After a while it can happen that the runner doesn't process changes anymore.
