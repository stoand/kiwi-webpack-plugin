import { expect } from 'chai';
import launchInstance, { calculateCoverage, loadSourceMap } from './runner';


describe('First Module', () => {
    
    it('this should work', () => {
        expect(1).to.equal(1);
        expect(1).to.equal(1);
    });
});
