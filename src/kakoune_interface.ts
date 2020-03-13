import { execFileSync } from 'child_process';

const maxNotificationLength = 30;
const inlineNormalTextColor = 'Default';
const inlineErrorTextColor = 'Error';
const statusChars = '••';
const uncoveredColors = 'gray';
const failedColors = 'red';
const successColors = 'green';

export type LineStatus = 'uncovered' | 'fail' | 'success';
export type LineStatuses = {[ line: number]: LineStatus} ;
export type FileStatuses = {[ file: string]: LineStatuses} ;

export type LineLabel = { color: 'normal' | 'error', text: string };
export type LineLabels = {[ line: number]: LineLabel} ;
export type FileLabels = {[ file: string]: LineLabels} ;

// #SPC-kakoune_interface.running_instances
export function running_instances() {
    let lines = execFileSync('kak', ['-l'], { encoding: 'utf8' }).split('\n');
    // remove the last empty line
    return lines.splice(0, lines.length - 1);
}

// #SPC-kakoune_interface.send_command
export function send_command(instance: string, command: string) {
    let input = "eval -client client0 '" + command + "'";
    return execFileSync('kak', ['-p', instance], { encoding: 'utf8', input });
}

function command_all(command: string) {
    running_instances().forEach(instance => send_command(instance, command));
}

// #SPC-kakoune_interface.line_statuses
export function line_statuses(file_statuses: FileStatuses) {

    let format_lines = (lines: LineStatuses) => Object.keys(lines).map(line =>
        `\\"${Number(line)+  1}|{%opt{kiwi_color_${lines[Number(line)]}}}%opt{kiwi_status_chars}\\"`).join(' ');

    let set_highlighters = Object.keys(file_statuses).map(file => 'eval %sh{ [ "$kak_buffile" = "' + file + '" ] && ' +
        'echo "set-option buffer kiwi_line_statuses %val{timestamp} ' + format_lines(file_statuses[file]) + '" }').join('\n');

    let commands = `
    	define-command -hidden -override kiwi_line_statuses %{
    		eval %sh{ [ -z "$kak_opt_kiwi_status_chars" ] && echo "declare-option str kiwi_status_chars; set-option window kiwi_status_chars \\"${statusChars}\\"" }
   		
    		eval %sh{ [ -z "$kak_opt_kiwi_color_uncovered" ] && echo "declare-option str kiwi_color_uncovered; set-option window kiwi_color_uncovered \\"${uncoveredColors}\\"" }
    		eval %sh{ [ -z "$kak_opt_kiwi_color_fail" ] && echo "declare-option str kiwi_color_fail; set-option window kiwi_color_fail \\"${failedColors}\\"" }
    		eval %sh{ [ -z "$kak_opt_kiwi_color_success" ] && echo "declare-option str kiwi_color_success; set-option window kiwi_color_success \\"${successColors}\\"" }
    		
    		eval %sh{ [ -z "$kak_opt_kiwi_line_statuses" ] && echo "declare-option line-specs kiwi_line_statuses; addhl global/ flag-lines Default kiwi_line_statuses" }
        	
    		${set_highlighters}
    	}
    	

    	hook global WinDisplay .* kiwi_line_statuses
    	kiwi_line_statuses
    `;

    command_all(commands);
}

function fix_size(text: string, length: number) {
    let chars = text.split('');
    if (chars.length > length) {
        chars = chars.splice(0, length - 3);
        return chars.join('') + ' ..';
    } else {
        while (chars.length < length) chars.push(' ');
        return chars.join('');
    }
}

// #SPC-kakoune_interface.line_notifications
export function line_notifications(file_notifications: FileLabels) {

    let format_lines = (lines: LineLabels) => Object.keys(lines).map(line => {
        let { color, text } = lines[Number(line)];
        let truncated_text = fix_size(text, maxNotificationLength);
        let color_opt = `kiwi_color_${color}_notification`;
        let num = Number(line)+ 1 ;
        return `\\"${num}|{Default} {%opt{${color_opt}}}${truncated_text}\\"`;
    }).join(' ');

    let set_highlighters = Object.keys(file_notifications).map(file => 'eval %sh{ [ "$kak_buffile" = "' + file + '" ] && ' +
        'echo "set-option buffer kiwi_line_notifications %val{timestamp} ' + format_lines(file_notifications[file]) + '" }').join('\n');

    let commands = `
		eval %sh{ [ -z "$kak_opt_kiwi_color_normal_notification" ] && echo "declare-option str kiwi_color_normal_notification; set-option window kiwi_color_normal_notification \\"${inlineNormalTextColor}\\"" }
		eval %sh{ [ -z "$kak_opt_kiwi_color_error_notification" ] && echo "declare-option str kiwi_color_error_notification; set-option window kiwi_color_error_notification \\"${inlineErrorTextColor}\\"" }
    		
    	define-command -hidden -override kiwi_line_notifications %{
    		eval %sh{ [ -z "$kak_opt_kiwi_line_notifications" ] && echo "declare-option line-specs kiwi_line_notifications; addhl global/ flag-lines Default kiwi_line_notifications" }

    		${set_highlighters}
    	}
    	
    	hook global WinDisplay .* kiwi_line_notifications
    	kiwi_line_notifications
    `;

    command_all(commands);
}
