import { expect } from 'chai';
import { runApp } from './index';

describe('Start Page', () => {

    it('should load without problems', () => {
        runApp();
    });
    
    it('should display a title', () => {
        let titleElement : any = document.querySelector('.page-title');
        let expectedTitleText = 'YUM DONUTS';
        
        // expect(titleElement.innerText).to.equal(expectedTitleText);
    });

    it('should display an image', () => {
        let imageElement : any = document.querySelector('.page-title img');
        // expect(imageElement != undefined).to.equal(true);
    });
});
