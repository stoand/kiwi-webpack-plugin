import { expect } from 'chai';
import { asdf } from './index';

describe('First Module', () => {
    it('this should work', () => {
        expect(1).to.equal(1);
    });

    it('this should fail', () => {
        expect(asdf()).to.equal(3);
    });

    xit('this should be ignored', () => {
        console.log(4);
    });

    // fit('only this test will run if enabled', () => {
    // 	console.log(1)
    // });
});

describe('Second Module', () => {


    it('another working test', async () => {

        await new Promise(resolve => setTimeout(resolve, 0));
        expect(5).to.equal(5);

        let a = true;


        const o = {
            a: [1, 2, [[
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
                'eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                'test',
                'foo']], 4],
            b: [[['za', 1], ['zb', 'test']]]
        };


        if (a) {
            console.log(Object.keys(o).slice(0, 5));

            console.log({ a: 1, b: { c: 2 } }, []);
        }

        // for (let i = 0; i <= 6; i++) {
        //     console.log(2);
        // }
    });

    it('failing', () => {
        expect({a: 1}).to.eql({a : 2});
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
