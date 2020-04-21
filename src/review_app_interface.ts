// #SPC-review_app.interface
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
import { RunResult } from './runner';

const reviewAppDir = path.resolve(process.cwd(), 'node_modules/kiwi-webpack-plugin/review_app');
const startScriptName = 'start.sh';
const resultFileName = 'kiwi_test_results.json';

export function startReviewApp() {
    // disabled
    return;
    
    // Try to run the review app
    let reviewApp = spawn('bash', ['-e', path.resolve(reviewAppDir, startScriptName)]);

    reviewApp.stderr.on('data', (data: any) => console.error(data.toString()));
    reviewApp.stdout.on('data', (data: any) => console.log(data.toString()));
}

export function updateReviewAppState(runResult: RunResult) {
    // disabled
    return;
    
    let resultFilePath = path.resolve(reviewAppDir, resultFileName);

    fs.writeFile(resultFilePath, JSON.stringify(runResult), (err: any) => {
        if (err) {
            console.error(err);
        }
    });
}
