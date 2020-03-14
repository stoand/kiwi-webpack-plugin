import { expect } from 'chai';

describe('First Module', () => {
    it('this should work', () => {
        expect(1).to.equal(1);
    });

    it('this should fail', () => {
        expect(2).to.equal(2);
    });
});

describe('Second Module', () => {

    it('another working test', () => {
        expect(3).to.equal(3);
        for (let i = 0; i <= 6; i++) {
            console.log('a');
        }
    });
});
