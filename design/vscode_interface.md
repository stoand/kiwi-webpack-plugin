# SPC-vscode_interface
partof: REQ-purpose
###

## [[.plugin]]

Unlike [[SPC-kakoune_interface]] where ad-hoc commands
can be issued to editor instances, VSCode works through plugins.

The `vscode_plugin` directory houses everything the vscode plugin needs.

The extension will not be published, rather, the `code --install-extension` command
will be run if the plugin detects vscode is installed and the user agrees to installing the extension.

## [[.line_statuses]]

Line statuses are displayed before line numbers and take the form of a colored bar indicating
coverage and involvement in failing tests.

## [[.line_notifications]]

Unlike with [[SPC-kakoune_interface]], line notification text is displayed _after_ the line of code.
