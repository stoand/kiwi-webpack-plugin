import { execFileSync } from 'child_process';


const deadKakInstancePostfix = '(dead)';

const maxNotificationLength = 30;
const inlineNormalTextColor = 'Default';
const inlineErrorTextColor = 'Error';
const statusChars = '██';
const uncoveredColors = 'StatusLine';
const failedColors = 'Error';
const successColors = 'string';

const rightCurlyBraceLookalike = '｝';
const leftCurlyBraceLookalike = '｛';
const verticalLineLookalike = '｜';

// When to update the highlighters
const refreshHighlighting = [
    'WinDisplay',
    // 'ModeChange',
    // 'InsertKey',
    // 'NormalKey',
    'RawKey',
];

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
    return lines.splice(0, lines.length - 1).filter(line => line.indexOf(deadKakInstancePostfix) == -1);
}

// #SPC-kakoune_interface.init_highlighters
export function init_highlighters() {
    let commands = `
		eval %sh{ [ -z "$kak_opt_kiwi_line_statuses" ] &&
			echo "declare-option line-specs kiwi_line_statuses; addhl global/ flag-lines Default kiwi_line_statuses" }
			
		eval %sh{ [ -z "$kak_opt_kiwi_line_notifications" ] &&
			echo "declare-option line-specs kiwi_line_notifications; addhl global/ flag-lines Default kiwi_line_notifications" }
    `;

    command_all(commands);
}


// #SPC-kakoune_interface.send_command
export function send_command(instance: string, command: string) {
    let input = "eval -client client0 '" + command + "'";
    return execFileSync('kak', ['-p', instance], { encoding: 'utf8', input });
}

function command_all(command: string) {
    running_instances().forEach(instance => send_command(instance, command));
}

let line_statuses_previous_files: string[] = [];

// #SPC-kakoune_interface.line_statuses
export function line_statuses(file_statuses: FileStatuses) {

    let format_lines = (lines: LineStatuses) => Object.keys(lines).map(line => {
        let value = lines[Number(line)];
        let spaces = statusChars.split('').map(_ => ' ').join('');
        let text = value != 'success' ? spaces : '%opt{kiwi_status_chars}';
        return `\\"${Number(line)+  1}|{%opt{kiwi_color_${value}}}${text}\\"`;
    }).join(' ');

	// Clear statuses from previous files that are no longer mentioned
    for (let previous_file of line_statuses_previous_files) {
        if(!file_statuses[previous_file]) {
            file_statuses[previous_file] = {};
        }
    }

    let set_highlighters = Object.keys(file_statuses).map(file => 'eval %sh{ [ "$kak_buffile" = "' + file + '" ] && ' +
        'echo "set-option buffer kiwi_line_statuses %val{timestamp} ' + format_lines(file_statuses[file]) + '" }').join('\n');


    let refresh_hooks = refreshHighlighting.map((name: string) =>
        `hook -group kiwi-line-statuses-group global ${name} .* kiwi_line_statuses`).join('\n');

    let commands = `
    	define-command -hidden -override kiwi_line_statuses %{
    		declare-option str kiwi_status_chars "${statusChars}"
   		
    		declare-option str kiwi_color_uncovered "${uncoveredColors}"
    		declare-option str kiwi_color_fail "${failedColors}"
    		declare-option str kiwi_color_success "${successColors}"
        	
    		${set_highlighters}
    	}
    	
    	remove-hooks global kiwi-line-statuses-group

		${refresh_hooks}
		
    	kiwi_line_statuses
    `;

    line_statuses_previous_files = Object.keys(file_statuses);

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

let line_notificaitons_previous_files: string[] = [];

function escape_flag_lines(text: string) {
    return text
        // Escape by doubling
        .replace(/"/g, '""')
        .replace(/'/g, "''")
        .replace(/\%/g, "%%")
        // Since kakoune (apparently) provides no way of escaping these characters,
        // we replace them with lookalikes
        .replace(/\{/g, leftCurlyBraceLookalike)
        .replace(/\}/g, rightCurlyBraceLookalike)
        .replace(/\|/g, verticalLineLookalike);
}

// #SPC-kakoune_interface.line_notifications
export function line_notifications(file_notifications: FileLabels) {

    let format_lines = (lines: LineLabels) => Object.keys(lines).map(line => {
        let { color, text } = lines[Number(line)];
        let truncated_text = fix_size(text, maxNotificationLength);
        let escaped_text = escape_flag_lines(truncated_text);
        let color_opt = `kiwi_color_${color}_notification`;
        let num = Number(line);
        return `"${num}|{Default} {%opt{${color_opt}}}${escaped_text}"`;
    }).join(' ');

    let set_highlighters = Object.keys(file_notifications).map((file, index) =>
        `declare-option str-list kiwi_line_notifications_${index} ${format_lines(file_notifications[file])} \n` +
        `eval %sh{ [ "$kak_buffile" = "${file}" ] && ` +
        `echo "set-option buffer kiwi_line_notifications %val{timestamp} %opt{kiwi_line_notifications_${index}}" }`).join('\n');

    let remove_highlighters = line_notificaitons_previous_files.filter(file => !file_notifications[file]).map(file => 'eval %sh{ [ "$kak_buffile" = "' + file + '" ] && ' +
        'echo "set-option buffer kiwi_line_notifications %val{timestamp} " }').join('\n');

    let refresh_hooks = refreshHighlighting.map((name: string) =>
        `hook -group kiwi-line-notifications-group global ${name} .* kiwi_line_notifications`).join('\n');

    let commands = `
		declare-option str kiwi_color_normal_notification "${inlineNormalTextColor}"
		declare-option str kiwi_color_error_notification "${inlineErrorTextColor}"
    		
    	define-command -hidden -override kiwi_line_notifications %{
    		${set_highlighters}

    		${remove_highlighters}
    	}

    	remove-hooks global kiwi-line-notifications-group

		${refresh_hooks}
    	
    	kiwi_line_notifications
    `;

    line_notificaitons_previous_files = Object.keys(file_notifications);

    command_all(commands);
}
