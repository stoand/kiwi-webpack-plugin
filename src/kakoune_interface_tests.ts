// Tests for functions that control interaction with the Kakoune editor

// Since it's difficult to programatically check the state of the Kakoune
// editor THESE TESTS REQUIRE MANUAL INTERACTION

// Another purpose of these tests is to have a place to run this functionality
// in isolation while in development.

import { line_statuses, line_notifications } from './kakoune_interface';
import path from 'path';

// Test the editor interactions while editing this file
let currentFile = path.resolve(process.cwd(), 'src/kakoune_interface_tests.ts');

// #SPC-kakoune_interface.tst-line_statuses
function test_line_statuses() {
    line_statuses({
        [currentFile]: {
            10: 'uncovered',
            11: 'fail',
            12: 'uncovered',
        }
    });
}

test_line_statuses();

// #SPC-kakoune_interface.tst-line_notifications
function test_line_notifications() {
    line_notifications({
        [currentFile]: {
            10: { text: '1, 2, 3', color: 'error' },
            11: { text: 'this text goes here', color: 'normal' },
            12: { text: 'this text is too long because it should be truncated', color: 'normal' },
        }
    });
}

test_line_notifications();
