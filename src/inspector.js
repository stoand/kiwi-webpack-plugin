const inspector = require('inspector');
const session = new inspector.Session();
const toIstanbul = require('v8-to-istanbul'); 
session.connect();

session.post('Profiler.enable', () => {
  session.post('Profiler.startPreciseCoverage', { "callCount": true, "detailed": true }, () => {
    // Invoke business logic under measurement here...
    require('./main.ts');

    // some time later...
    session.post('Profiler.takePreciseCoverage', (err, v) => {
        let main = v.result.find(r => r.url.indexOf('main.ts') !== -1);

        console.log(main.functions);

        const converter = toIstanbul(main.url);
        converter.load().then(() => {
            converter.applyCoverage(main.functions);
            console.log(converter.toIstanbul());

            let a = Object.values(converter.toIstanbul())[0]

            console.log(a.branchMap[3]);
            
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
