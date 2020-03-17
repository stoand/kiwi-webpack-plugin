import { expect } from 'chai';
import { asdf } from './index';

describe('First Module', () => {
    it('this should work', () => {
        expect(1).to.equal(1);
    });

    it('this should fail', () => {
        let a = 1;
        
        expect(asdf()).to.equal(3);
    });
});

function asdf2() {
    console.log(1)
}

asdf2();

let a: any = window;

console.log(1);
console.log(a.__kiwi_testModules);

// a['__kiwi_runNextTest']();


describe('Second Module', () => {
   

    it('another working test', async () => {

        await new Promise(resolve => setTimeout(resolve, 100));
        expect(5).to.equal(3);

        let a = false;

        if (a) {
            console.log(1);
            console.log(2);
        }

        // for (let i = 0; i <= 6; i++) {
        //     console.log(2);
        // }
    });
});
