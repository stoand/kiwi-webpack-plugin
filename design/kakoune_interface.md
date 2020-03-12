# SPC-kakoune_interface
partof: REQ-purpose
###

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

## [[.line_notifications]]

Takes a list of files and lines with text for each line.

It adds a highlighter to display text after each line.

## [[.show_location_list_command]]

Defines a command with the given name in kakoune that

displays a hyperlinked list of

* file name
* line number (use line zero for the whole file)
* (optional) colored text

## [[.jump_to_line_command]]

Defines a command with the given name in kakoune that jumps to a given file and line.
