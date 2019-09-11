import SliderModel from "../../src/MVP modules/Slider/SliderModel";

describe("Options object extension(getOptions method)", () => {
    let model;

    test("extends object when user changes classes", () => {

        model = new SliderModel();
        model.setOptions({
            classes: {
                "jquery-slider-range": "my-slider-range"
            }
        });

        const testOptions = $.extend(true, {}, model.defaultOptions);
        testOptions.classes["jquery-slider-range"] = "my-slider-range";

        expect(model.getOptions()).toEqual(testOptions);
    });

    test("extends object with max = 60 and min = 20", () => {
        model = new SliderModel();
        model.setOptions({min: 20, max: 60});

        const testOptions = $.extend(true, {}, model.defaultOptions);

        testOptions.min = 20;
        testOptions.max = 60;

        expect(model.getOptions()).toEqual(testOptions);
    });

    test("options are undefined when user passes no options", () => {
        model = new SliderModel();

        expect(model.getOptions()).toEqual(undefined);
    });
});