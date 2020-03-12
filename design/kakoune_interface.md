# SPC-kakoune_interface
partof: REQ-purpose
###

## [[.running_instances]]

Returns a list of running kakoune instances

## [[.send_command]]

Sends a command to the given kakoune instances

## [[.current_file]]

Returns the complete file path a kakoune instance is currently editing

## [[.status_before_line]]

Takes a list of files and lines and one of three statuses for each line.

It adds a highlighter that displays a dot and a space in front of all specified lines
with a color depending on the status.

## [[.label_after_line]]

Takes a list of files and lines with text for each line.

It adds a highlighter to display text after each line.

## [[.show_location_list]]

Displays a hyperlinked list of
* file name
* line number (use line zero for the whole file)
* (optional) colored text

## [[.jump_to_line]]

Jumps to a given file and line
