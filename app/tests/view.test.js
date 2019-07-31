//import {expect} from 'chai';
import View from '../src/MVP modules/view/view'
import {getClassList, createInstance, createEvent} from "../src/functions/private/view.private";
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
            $('body').append(app.view.html);

            expect(getClassList($('div'))).to.deep.equal(defaultClasses);

            app.view.html.remove();

        });
        
        it("set classes when user adds extra class 'my-slider' to 'jquery-slider' class", () => {

            const app = createInstance({
                classes: {
                'jquery-slider': 'my-slider'
                }
            });

            $('body').append(app.view.html);

            const domClasses = getClassList($('div'));

            const testClasses = Object.assign({}, defaultClasses);
            testClasses["jquery-slider"] = 'my-slider';

            expect($('.jquery-slider').hasClass('my-slider')).to.be.true;
            expect(domClasses).to.deep.equal(testClasses);


            app.view.html.remove();

        });

    });
    
    describe("slider events", () => {
        
        it("move jquery-slider-handle to specific coordinates inside the slider", () => {

            const app = createInstance();
            $("body").append(app.view.html);

            const slider = $('.jquery-slider')[0];

            const sliderCoords = getCoords(slider);
            const sliderMiddleLeft = sliderCoords.left + sliderCoords.width/2;

            const handle = $('.jquery-slider-handle')[0];
            console.log(handle);
            const handleCoords = getCoords(handle);


            const mousedownEvent = createEvent('mousedown', handleCoords.left, handleCoords.top);
            $(handle).trigger(mousedownEvent);

            const mousemoveEvent = createEvent('mousemove', sliderMiddleLeft, handleCoords.top);
            $(document).trigger(mousemoveEvent);

            $(handle).trigger('mouseup');

            const newHandleCoords = getCoords(handle);

            const coordsObj = {
              top: newHandleCoords.top,
              left: newHandleCoords.left
            };
            const testcoordsObj = {
              top: handleCoords.top,
              left: sliderMiddleLeft
            };

            expect(coordsObj).to.deep.equal(testcoordsObj);

            app.view.html.remove();
        });
        
        it("handle stays within the slider when the cursor goes outside", () => {

            const app = createInstance();
            $('body').append(app.view.html);

            const handle = $('.jquery-slider-handle')[0];
            const slider = $('.jquery-slider')[0];

            const sliderCoords = getCoords(slider);
            const handleCoords = getCoords(handle);

            const mousedownEvent = createEvent('mousedown',
                handleCoords.left, handleCoords.top);

            $(handle).trigger(mousedownEvent);

            const mousemoveEvent = createEvent('mousemove',
                sliderCoords.left - 10, handleCoords.top);

            $(document).trigger(mousemoveEvent);

            $(document).trigger('mouseup');

            const newHandleCoords = getCoords(handle);
            const newSliderCoords = getCoords(slider);

            const newLeft = newHandleCoords.left - newSliderCoords.left;

            expect(newLeft).to.equal(0);

            app.view.html.remove();
        });
    });
});