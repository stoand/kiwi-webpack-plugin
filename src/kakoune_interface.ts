import { execFileSync } from 'child_process';

export type LineStatuses = {[line: number]: boolean};
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
    let commands = `
		eval %sh{ [ -z "$kak_opt_kiwi_color_uncovered" ] && echo "declare-option str kiwi_color_uncovered; set-option window kiwi_color_uncovered \\"grey\\"" }
		eval %sh{ [ -z "$kak_opt_kiwi_color_fail" ] && echo "declare-option str kiwi_color_fail; set-option window kiwi_color_fail \\"red\\"" }
		eval %sh{ [ -z "$kak_opt_kiwi_color_success" ] && echo "declare-option str kiwi_color_success; set-option window kiwi_color_success \\"green\\"" }
    
    	define-command -hidden -override kiwi_line_statuses %{
        	echo "Hello" %val{buffile}
    	}

    	hook global WinDisplay .* kiwi_line_statuses

    	kiwi_line_statuses
    `;
    
    running_instances().forEach(instance => send_command(instance, commands));
}
