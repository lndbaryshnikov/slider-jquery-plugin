//import {expect} from 'chai';


import View from '../src/MVP modules/view/view'
import Model from '../src/MVP modules/model/model'
import Presenter from '../src/MVP modules/presenter/presenter'


describe('View', () => {
   
    it("getHtml method", () => {

        const view = new View();
        expect(!!view.html).to.be.true;
        
    });

    describe("setModel method for setting classes", () => {

        it("Set classes when user passes no classes in model", () => {

            const model = new Model();
            const separateView = new View();
            const presenter = new Presenter(new View());

            presenter.model = model;

            expect(presenter.view.html).to.deep.equal(separateView.html);



        });

    });
});