import SliderModel from "../../src/MVP modules/Slider/SliderModel";

describe("getDefaultOptions method", () => {
    const horizontalDefaults = {
        min: 0,
        max: 100,
        step: 1,
        value: 0,
        orientation: 'horizontal',
        range: false,
        tooltip: false,

        classes: {
            "jquery-slider jquery-slider-horizontal": "",
            "jquery-slider-range": "",
            "jquery-slider-handle": ""
        }
    };

   const verticalDefaults = {
       min: 0,
       max: 100,
       step: 1,
       value: 0,
       orientation: 'vertical',
       range: false,
       tooltip: false,

       classes: {
           "jquery-slider jquery-slider-vertical": "",
           "jquery-slider-range": "",
           "jquery-slider-handle": ""
       }
   } ;

   test("when orientation = horizontal", () => {
       expect(SliderModel.getDefaultOptions('horizontal')).toEqual(horizontalDefaults);
   });

    test("when orientation = vertical", () => {
        expect(SliderModel.getDefaultOptions('vertical')).toEqual(verticalDefaults);
    });
});