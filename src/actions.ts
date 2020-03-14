import { TestModule } from './runner';
import { line_notifications, FileLabels } from './kakoune_interface';

export default function handleTestRun(modules: TestModule[]) {
    setNotifications(modules);
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
