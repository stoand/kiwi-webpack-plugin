import { TestModule } from './runner';
import { line_notifications, running_instances, FileLabels } from './kakoune_interface';

const scanInterval = 150;

let prevScanner: NodeJS.Timeout;

export default function handleTestRun(modules: TestModule[]) {
    
    setNotifications(modules);

	// disable the scanner from the previous call to this function
	// the entire editor state is updated by every call
    if (prevScanner) {
        clearInterval(prevScanner);
    }

	// If new kakoune editors are opened perform actions on them
    let knownInstances = 0;

	prevScanner = setInterval(() => {
    	let instanceCount = running_instances().length;
    	
    	if (instanceCount > knownInstances) {
        	// New instance detected
            setNotifications(modules);
    	}
    	
        knownInstances = instanceCount;
        
	}, scanInterval);
}

// #SPC-actions.set_notifications
function setNotifications(modules: TestModule[]) {
    
    let files: FileLabels = {};
    
    modules.forEach(module => {
        module.tests.forEach(test => {
            test.consoleLogs.forEach(log => {
                files[log.trace.source] = files[log.trace.source] || {};
                let existing = files[log.trace.source][log.trace.line]?.text;
                let joinedArgs = log.args.join(', ');
                let text = existing ? existing + ', ' + joinedArgs : joinedArgs;
                files[log.trace.source][log.trace.line] = { text, color: 'normal' };
            });

            if (test.error) {
                files[test.error.trace.source] = files[test.error.trace.source] || {};
                files[test.error.trace.source][test.error.trace.line] = { text: test.error.message, color: 'error' };
            }
        });
    });

    line_notifications(files);
}
