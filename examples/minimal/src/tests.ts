import { expect } from 'chai';
import { asdf } from './index';

function a2() {
    // throw 3;
}

describe('First Module', () => {
    it('this should work', () => {

        a2();
        expect(1).to.equal(1);
    });

    it('this should fail', () => {

        // asdf();
        let a = 1;

        // asdf();
        // asdf();
        
        expect(asdf()).to.equal(3);
    });
});

describe('Second Module', () => {
   

    it('another working test', async () => {

        await new Promise(resolve => setTimeout(resolve, 0));
        expect(5).to.equal(5);

        let a = true;

        if (a) {
            console.log(1);
            console.log(2);
        }

        // for (let i = 0; i <= 6; i++) {
        //     console.log(2);
        // }
    });
});

function thirdModuleAction1() {
    let a = 5
    return a;
}

// SPC-runner.bug_good_coverage_overriding_bad
describe('Demonstrate the presidence of failing test coverage', () => {
    it('first test fails', () => {
        expect(thirdModuleAction1()).to.equal(5);
    });

    it('second test succeeds', () => {
        expect(thirdModuleAction1()).to.equal(9);
    });
});
