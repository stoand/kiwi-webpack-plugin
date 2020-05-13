import { expect } from 'chai';
import { asdf } from './index';

let f: any = 2;

function f1() {
    // f = 1;
}

function a2() {
    // throw 3;
}

describe('First Module', () => {
    it('this should work', () => {
        f1();

        a2();
        expect(1).to.equal(1);
    });

    it('this should fail', () => {
        expect(f).to.eql(2);
        

        // asdf();
        let a = 1;

        // asdf();
        // asdf();
        
        // expect(asdf()).to.equal(3);
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

let v = 1;

// SPC-actions.bug_good_coverage_overriding_bad
describe('Demonstrate the presidence of failing test coverage', () => {
    it('first test fails', () => {
        v = 2;
        expect(thirdModuleAction1()).to.equal(5);
    });

    it('second test succeeds', () => {
        // other tests should not affect each other
        expect(v).to.equal(1);
        
        expect(thirdModuleAction1()).to.equal(9);
    });
});
