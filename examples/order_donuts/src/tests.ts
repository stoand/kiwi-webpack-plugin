import { expect } from 'chai';
import { asdf,runApp } from './index';

function a2() {
    // throw 3;
}

describe('First Module', () => {
    it('this should work', () => {

        a2();
        expect(1).to.equal(1);

        runApp();
    });

    it('this should fail', () => {

        // asdf();
        let a = 1;

        // asdf();
        // asdf();
        
        expect(asdf()).to.equal(4);
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
