import { expect } from 'chai';

describe('First Module', () => {
    it('this should work', () => {
        expect(1).to.equal(1);
    });

    it('this should fail', () => {
        expect(2).to.equal(3);
    });
});

describe('Second Module', () => {

    it('another working test', async () => {
        expect(2).to.equal(3);
        // await new Promise(resolve => setTimeout(resolve, 1000));
        for (let i = 0; i <= 6; i++) {
            console.log(3);
        }
    });
});
