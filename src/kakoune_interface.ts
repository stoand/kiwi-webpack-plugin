import { execFileSync } from 'child_process';

const statusChars = '••';
const uncoveredColors = 'gray';
const failedColors = 'red';
const successColors = 'green';

export type LineStatus = 'uncovered' | 'fail' | 'success';
export type LineStatuses = {[line: number]: LineStatus};
export type FileStatuses = {[file: string]: LineStatuses}; 

// console.log('00000000000', send_command(running_instances()[0], 'echo 1'));

line_statuses({});

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
		// eval %sh{ [ -z "$kak_opt_kiwi_color_fail" ] && 'declare-option str kiwi_color_fail; set-option window kiwi_color_fail "red"' }
		// eval %sh{ [ -z "$kak_opt_kiwi_color_success" ] && 'declare-option str kiwi_color_success; set-option window kiwi_color_success "green"' }

// SPC-kakoune_interface.line_statuses
export function line_statuses(file_statuses: FileStatuses) {

    file_statuses = {
        "/home/andreas/kiwi/src/kakoune_interface.ts": {
            0: 'uncovered',
            1: 'uncovered',
            2: 'fail',
            3: 'success',
        },
        "/home/andreas/kiwi/src/runner.ts": {
            3: 'success',
        },
    };

    let format_lines = (lines: LineStatuses) => Object.keys(lines).map(line =>
    	`\\"${Number(line)+1}|{%opt{kiwi_color_${lines[Number(line)]}}}%opt{kiwi_status_chars}\\"`).join(' ');

    let set_highlighters = Object.keys(file_statuses).map(file => 'eval %sh{ [ "$kak_buffile" = "' + file + '" ] && ' +
    	'echo "set-option buffer kiwi_line_statuses %val{timestamp} ' + format_lines(file_statuses[file]) + '" }').join('\n');
    
    let commands = `

    	define-command -hidden -override kiwi_line_statuses %{
    		eval %sh{ [ -z "$kak_opt_kiwi_status_chars" ] && echo "declare-option str kiwi_status_chars; set-option window kiwi_status_chars \\"${statusChars}\\"" }
   		
    		eval %sh{ [ -z "$kak_opt_kiwi_color_uncovered" ] && echo "declare-option str kiwi_color_uncovered; set-option window kiwi_color_uncovered \\"${uncoveredColors}\\"" }
    		eval %sh{ [ -z "$kak_opt_kiwi_color_fail" ] && echo "declare-option str kiwi_color_fail; set-option window kiwi_color_fail \\"${failedColors}\\"" }
    		eval %sh{ [ -z "$kak_opt_kiwi_color_success" ] && echo "declare-option str kiwi_color_success; set-option window kiwi_color_success \\"${successColors}\\"" }
    		
    		eval %sh{ [ -z "$kak_opt_kiwi_line_statuses" ] && echo "declare-option line-specs kiwi_line_statuses; addhl global/ flag-lines blue kiwi_line_statuses" }
        	
    		${set_highlighters}
    	}
    	

    	hook global WinDisplay .* kiwi_line_statuses
    	kiwi_line_statuses
    `;

    console.log(commands);
    
    running_instances().forEach(instance => send_command(instance, commands));
}
