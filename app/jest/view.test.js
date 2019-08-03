import $ from 'jquery';

//import {expect} from 'chai';
import View from '../src/MVP modules/view/view'
import {getClassList, createInstance, createEvent, moveHandleToCertainCoords} from "../src/functions/private/view.private";
import {defaultOptions} from '../src/MVP modules/model/model';
import getCoords from '../src/functions/common/getCoords'

const defaultClasses = defaultOptions.classes;


describe('View', () => {
    afterEach(() => {
        document.getElementsByTagName('html')[0].innerHTML = '';
    });
   
    test("should have html property", () => {
        const view = new View();

        expect(!!view.html).toBe(true);
    });

    describe("setModel method for setting classes", () => {
        test("set classes when user passes no classes in model", () => {
            const app = createInstance();

            app.createDom();

            expect(getClassList($('div'))).toEqual(defaultClasses);

            app.removeDom();
        });

        test("set classes when user adds extra class 'my-slider' to 'jquery-slider' class", () => {
            const app = createInstance({
                classes: {
                    'jquery-slider': 'my-slider'
                }
            });

            app.createDom();

            const domClasses = getClassList($('div'));

            const testClasses = Object.assign({}, defaultClasses);
            testClasses["jquery-slider"] = 'my-slider';

            expect($('.jquery-slider').hasClass('my-slider')).toBe(true);
            expect(domClasses).toEqual(testClasses);

            app.removeDom();
        });
    });
    
    describe("slider events", () => {
        test("move jquery-slider-handle to specific coordinates inside the slider", () => {
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

            console.log($('.jquery-slider').css("width"));
            //expect($('.jquery-slider').css('width')).toBe(100);
            //expect(newCoords).toEqual(testCoords);
            expect(testCoords).toEqual(0);

            app.removeDom();
        });
        
        test("handle stays within the slider when the cursor goes outside", () => {
            const app = createInstance();

            app.createDom();

            const slider = $('.jquery-slider')[0];
            const sliderCoords = getCoords(slider);

            const newHandleCoordsLeft = moveHandleToCertainCoords(sliderCoords.left - 10);

            const newLeft_1 = newHandleCoordsLeft.left - sliderCoords.left;

            const newHandleCoordsRight = moveHandleToCertainCoords(sliderCoords.right + 10);

            const newLeft_2 = newHandleCoordsRight.left - sliderCoords.left;
            const rightEdge = sliderCoords.width - newHandleCoordsRight.width;


            expect(newLeft_1).toBe(0);
            expect(newLeft_2).toBe(rightEdge);

            app.removeDom();
        });
    });
});