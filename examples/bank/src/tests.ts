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
        
        await new Promise(resolve => setTimeout(resolve, 200));
        expect(5).to.equal(5);

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
