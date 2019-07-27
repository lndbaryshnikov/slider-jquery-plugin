//import {expect} from 'chai';
import View from '../src/MVP modules/view/view'
import {getClassList, createInstance} from "../src/functions/private/view.private";
import {defaultOptions} from '../src/MVP modules/model/model';

const defaultClasses = defaultOptions.classes;


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