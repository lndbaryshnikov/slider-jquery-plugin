//import {expect} from 'chai';


import View from '../src/MVP modules/view/view'
import Model from '../src/MVP modules/model/model'
import Presenter from '../src/MVP modules/presenter/presenter'


const createInstance = (options) => {

    const model = new Model(options);
    const presenter = new Presenter(new View());

    presenter.model = model;

    return presenter;
};


describe('View', () => {
   
    it("getHtml method", () => {

        const view = new View();
        expect(!!view.html).to.be.true;
        
    });

    describe("setModel method for setting classes", () => {

        it("Set classes when user passes no classes in model", () => {

            const separateView = new View();
            const app = createInstance();
            expect(app.view.html).to.deep.equal(separateView.html);

        });
        
        it("Set classes when user passes extra class 'my-slider' to 'jquery-slider' class", () => {

            const app = createInstance({classes: {
                'jquery-slider': 'my-slider'
                }});


            $('body').append(app.view.html);
            expect($('.jquery-slider').hasClass('my-slider')). to.be.true;
        });

    });
});