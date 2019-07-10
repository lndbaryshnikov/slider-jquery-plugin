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

const getClassList = (elements) => {
    const classList = {};

    for (let i = 2; i < elements.length; i++) {

        //i = 2 cause first 'div' is mocha and second is empty - wrapper(view.js)
        const classesString = $(elements[i]).attr('class');
        const classesArray = classesString.split(' ');

        if(!!classesArray[1]) {

            const mainClass = classesArray[0];
            classesArray.shift();
            classList[mainClass] = classesArray.join(' ');

        } else {

            classList[classesArray[0]] = '';

        }
    }

    return classList;
};

const defaultClasses = {
    "jquery-slider": "",
    "jquery-slider-range": "",
    "jquery-slider-handle": ""
};


describe('View', () => {
   
    it("getHtml method", () => {

        const view = new View();
        expect(!!view.html).to.be.true;
        
    });

    describe("setModel method for setting classes", () => {

        it("Set classes when user passes no classes in model", () => {

            const app = createInstance();
            $('body').append(app.view.html);

            expect(getClassList($('div'))).to.deep.equal(defaultClasses);

            app.view.html.remove();

        });
        
        it("Set classes when user adds extra class 'my-slider' to 'jquery-slider' class", () => {

            const app = createInstance({
                classes: {
                'jquery-slider': 'my-slider'
                }
            });

            $('body').append(app.view.html);

            const divs = $('div');
            const domClasses = getClassList(divs);

            const testClasses = defaultClasses;
            testClasses["jquery-slider"] = 'my-slider';

            expect($('.jquery-slider').hasClass('my-slider')).to.be.true;
            expect(domClasses).to.deep.equal(testClasses);

            app.view.html.remove();

        });

    });
});