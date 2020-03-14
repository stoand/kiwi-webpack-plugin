# SPC-runner
partof: REQ-purpose
###

## [[.launcher]]

Instead of opting for mere browser api emulation, the runner
executes tests in a headless Chrome process.

https://gist.github.com/paulirish/78f46a302083dd757288b5fcc660d75c

[[.tst-launcher]]

Ensure the runner can communicate with a headless Chrome instance.

## [[.sourcemap]]

Since the coverage is ran on the compiled output,
we need source mapping to find out what scripts were originally run.

[[.tst_sourcemap]]

Ensure source maps work.

## [[.async]]

Support tests that run asynchronously.

If a test returns a promise wait for it.

Also handle errors returned by promises.

[[.tst-async_run]]

Ensure the runner can detect and wait for async tests to finish.

[[.tst-async_error]]

Ensure errors inside promises are handled correctly.

# Resulting Data

Takes the source code of compiled tests, runs them, and returns a list of modules.
Each module contains a list of tests and the following data for each test:

## [[.errors]]

A list of thrown errors and their
* content
* location - file and line

Note: this does not include `console.error`

[[.tst-errors]]

## [[.logs]]

A list of `console.log`s and their
* content
* location - file and line

[[.tst-logs]]

## [[.coverage]]

A list of files that ran while the test executed with a run count for every line.

[[.tst-coverage]]

Ensures that correct coverage information is
collected from multiple tests that were run.
