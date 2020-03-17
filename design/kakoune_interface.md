# SPC-kakoune_interface
partof: REQ-purpose
###

## [[.init_highlighters]]

In order to ensure that highlighters are displayed in the correct visual order,
initialize all highlighter buffers in a single command on startup.

## [[.running_instances]]

Returns a list of running kakoune instances

## [[.send_command]]

Sends a command to the given kakoune instances

## [[.line_statuses]]

Takes a list of files and lines and one of three statuses for each line.

It adds a highlighter that displays a dot and a space in front of all specified lines
with a color depending on the status.

The colors of the statuses are declared values that can be overriden in a `kakrc`:

```
kiwi_color_uncovered
kiwi_color_fail
kiwi_color_success
```

[[.tst-line_statuses]]

Ensure line statuses of all three color types can be correctly displayed.

## [[.line_notifications]]

Takes a list of files and lines with text for each line.

It adds a highlighter to display text after each line.

[[.tst-line_notifications]]

Ensure line notifications of both `normal` and `error` type can be correctly displayed.

Also ensure that lines are correctly truncated.

[[.tst-line_notifications_escaping]]

Ensure special characters such as " or { do not break the protocol.

## [[.show_location_list_command]]

Defines a command with the given name in kakoune that

displays a hyperlinked list of

* file name
* line number (use line zero for the whole file)
* (optional) colored text

[[.tst-show_location_list_command]]

Ensure the command opens a list of links and these links can be followed.

## [[.jump_to_line_command]]

Defines a command with the given name in kakoune that jumps to a given file and line.

[[.tst-jump_to_line_command]]

Ensure the command works but only on lines assigned to have jump navigation.
