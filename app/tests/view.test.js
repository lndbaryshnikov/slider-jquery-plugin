//import {expect} from 'chai';
import View from '../src/MVP modules/view/view'
import {getClassList, createInstance, createEvent, moveHandleToCertainCoords} from "../src/functions/private/view.private";
import {defaultOptions} from '../src/MVP modules/model/model';
import getCoords from '../src/functions/common/getCoords'

//styles here:
import '../src/styles/jquery-slider.scss'
import '../src/styles/jquery-slider-range.scss'
import '../src/styles/jquery-slider-handle.scss'

const defaultClasses = defaultOptions.classes;


describe('View', () => {
   
    it("should have html property", () => {

        const view = new View();
        expect(!!view.html).to.be.true;
        
    });

    describe("setModel method for setting classes", () => {

        it("set classes when user passes no classes in model", () => {

            const app = createInstance();
            app.createDom();

            expect(getClassList($('div'))).to.deep.equal(defaultClasses);

            app.removeDom();

        });
        
        it("set classes when user adds extra class 'my-slider' to 'jquery-slider' class", () => {

            const app = createInstance({
                classes: {
                'jquery-slider': 'my-slider'
                }
            });

            app.createDom();

            const domClasses = getClassList($('div'));

            const testClasses = Object.assign({}, defaultClasses);
            testClasses["jquery-slider"] = 'my-slider';

            expect($('.jquery-slider').hasClass('my-slider')).to.be.true;
            expect(domClasses).to.deep.equal(testClasses);

            app.removeDom();

        });

    });
    
    describe("slider events", () => {
        
        it("move jquery-slider-handle to specific coordinates inside the slider", () => {

            const app = createInstance();
            app.createDom();

            const slider = $('.jquery-slider')[0];
            const sliderCoords = getCoords(slider);

            const sliderMiddleLeft = sliderCoords.left + sliderCoords.width/2;

            const handle = $('.jquery-slider-handle')[0];
            const handleCoords = getCoords(handle);

            const newHandleCoords = moveHandleToCertainCoords(sliderMiddleLeft);

            const newCoords = {
              top: newHandleCoords.top,
              left: newHandleCoords.left
            };
            const testCoords = {
              top: handleCoords.top,
              left: sliderMiddleLeft
            };

            expect(newCoords).to.deep.equal(testCoords);

            app.removeDom();
        });
        
        it("handle stays within the slider when the cursor goes outside", () => {

            const app = createInstance();
            app.createDom();

            const slider = $('.jquery-slider')[0];
            const sliderCoords = getCoords(slider);

            const newHandleCoordsLeft = moveHandleToCertainCoords(sliderCoords.left - 10);

            const newLeft_1 = newHandleCoordsLeft.left - sliderCoords.left;

            const newHandleCoordsRight = moveHandleToCertainCoords(sliderCoords.right + 10);

            const newLeft_2 = newHandleCoordsRight.left - sliderCoords.left;
            const rightEdge = sliderCoords.width - newHandleCoordsRight.width;


            expect(newLeft_1).to.equal(0);
            expect(newLeft_2).to.equal(rightEdge);

            app.removeDom();
        });
    });
});