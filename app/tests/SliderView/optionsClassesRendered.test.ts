// import $ from "jquery";

import {getClassList} from "../../src/functions/private/view.private";
import SliderModel from "../../src/MVP modules/Slider/SliderModel";
import SliderPresenter from "../../src/MVP modules/Slider/SliderPresenter";
import SliderView from "../../src/MVP modules/Slider/SliderView";

const defaultClasses = (new SliderModel()).defaultOptions.classes;

describe("setModel method for setting classes", () => {
    let slider: SliderPresenter;

    beforeEach(() => {
       slider = new SliderPresenter(new SliderView(), new SliderModel());
    });

    afterEach(() => {
        slider.destroy();
    });

    test("set classes when user passes no classes in _model", () => {
        slider.initialize(document.body);

        expect(getClassList($('div'))).toEqual(defaultClasses);
    });

    test("set classes when user adds extra class 'my-slider' to 'jquery-slider' class", () => {
        slider.initialize(document.body, {
            classes: {
                'jquery-slider': 'my-slider'
            }
        });

        const domClasses = getClassList($('div'));

        const testClasses = $.extend(true, {}, defaultClasses);

        testClasses["jquery-slider"] = 'my-slider';

        expect($('.jquery-slider').hasClass('my-slider')).toBe(true);
        expect(domClasses).toEqual(testClasses);
    });
});