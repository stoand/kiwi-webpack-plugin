// Tests for functions that control interaction with the Kakoune editor
// Since it's difficult to programatically check the state of the Kakoune
// editor THESE TESTS REQUIRE MANUAL INTERACTION

// Another purpose of these tests is to have a place to run this functionality
// in isolation while in development.

import { init_highlighters, line_statuses, line_notifications } from './kakoune_interface';
import path from 'path';

// Test the editor interactions while editing this file
let currentFile = path.resolve(process.cwd(), 'src/kakoune_interface_tests.ts');

let empty: any = {};
for (let i = 0; i < 200; i++) {
    empty[i] = 'uncovered';
}

// #SPC-kakoune_interface.tst-line_statuses
function test_line_statuses() {
    line_statuses({
        [currentFile]: {
            ...empty,
            10: 'uncovered',
            11: 'fail',
            
            12: 'success',
        }
    });
}

// #SPC-kakoune_interface.tst-line_notifications
function test_line_notifications() {
    line_notifications({
        [currentFile]: {
            38: { text: '1, 2, 3', color: 'error' },
            39: { text: 'this text goes here', color: 'normal' },
            40: { text: 'this text is too long because it should be truncated', color: 'normal' },
            // #SPC-kakoune_interface.tst-line_notifications_escaping
            42: { text: `handl/.""'%%{{ correctly`, color: 'normal' },
        }
    });
}

init_highlighters();

// The notifications should be displayed to the left of statuses
test_line_notifications();

test_line_statuses();
