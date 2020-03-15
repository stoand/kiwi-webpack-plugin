const inspector = require('inspector');
const session = new inspector.Session();
const toIstanbul = require('v8-to-istanbul'); 
session.connect();

let src = require('fs').readFileSync('./src/main.ts', { encoding: 'utf8' });

session.post('Profiler.enable', () => {
  session.post('Profiler.startPreciseCoverage', { "callCount": true, "detailed": true }, () => {
    // Invoke business logic under measurement here...
    require('./main.ts');
    // console.log(src);

    console.log('slice'.slice(0, 4));

    console.log(getLineAndColumn(93));

    console.log(getLineAndColumn(22));
    console.log(getLineAndColumn(44));

    function getLineAndColumn(offset) {
        let lines = src.slice(0, offset).split('\n');
        let lastLine = lines[lines.length - 1];

        return { line: lines.length, column: lastLine.length + 1 };
    }

    // some time later...
    session.post('Profiler.takePreciseCoverage', (err, v) => {
        let main = v.result.find(r => r.url.indexOf('main.ts') !== -1);

        console.log(main.functions[0]);

        const converter = toIstanbul(main.url);
        converter.load().then(() => {
            // converter.applyCoverage(main.functions);
            // console.log(converter.toIstanbul());

            // let a = Object.values(converter.toIstanbul())
            // console.log(a);

            // console.log(a.branchMap[3]);
            
            // console.log(JSON.stringify(converter.toIstanbul()));
        });
        
    //   // Write profile to disk, upload, etc.
    //   if (!err) {
    //       console.log(profile);
    //       console.log(profile.endTime - profile.startTime);
    //   }
    });
  });
});
