import { expect } from 'chai';
import { asdf } from './index';

describe('First Module', () => {
    it('this should work', () => {
        expect(1).to.equal(1);
    });

    it('this should fail', () => {
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

let g = 1;

function actionG() {
    g = 2;
}

actionG();

let v = 1;

// SPC-actions.bug_good_coverage_overriding_bad
describe('Demonstrate the presidence of failing test coverage', () => {
    it('first test succeeds', () => {
        v = 2;
        expect(thirdModuleAction1()).to.equal(5);
        
    });

    it('ensure proper test isolation', () => {
        // tests should not affect each other
        expect(v).to.equal(1);
    });
});
