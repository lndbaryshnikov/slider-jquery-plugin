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

        const testOptions = $.extend(true, {}, SliderModel.getDefaultOptions('horizontal'));
        testOptions.classes["jquery-slider-range"] = "my-slider-range";

        expect(model.getOptions()).toEqual(testOptions);
    });

    test("extends object with max = 60 and min = 20", () => {
        model = new SliderModel();
        model.setOptions({min: 20, max: 60});

        const testOptions = $.extend(true, {}, SliderModel.getDefaultOptions('horizontal'));

        testOptions.min = 20;
        testOptions.max = 60;

        expect(model.getOptions()).toEqual(testOptions);
    });

    test("options are undefined when user passes no options", () => {
        model = new SliderModel();

        expect(model.getOptions()).toEqual(undefined);
    });

    test("options.classes and options.orientation depending on orientation", () => {
        const model = new SliderModel();

        const check = (model: SliderModel, orientation: 'horizontal' | 'vertical' = 'horizontal') => {
            model.setOptions({ orientation: orientation });

            expect(model.getOptions().orientation).toBe(orientation);
            expect(`jquery-slider jquery-slider-${orientation}` in model.getOptions().classes).toBeTruthy();
            expect(model.getOptions()).toEqual(SliderModel.getDefaultOptions(orientation));
        };

        check(model);
        check(model, 'horizontal');
        check(model, 'vertical');
    });
    
    test("options.classes go in order", () => {
        const model = new SliderModel();

        model.setOptions({
            classes: {
                "jquery-slider-range": "my-range",
                "jquery-slider": "my-slider",
                "jquery-slider-handle": "my-handle"
            }
        });

        const classes = model.getOptions().classes;
        const defaultClasses = SliderModel.getDefaultOptions('horizontal').classes;

        let mainClass: keyof typeof classes;

        for ( mainClass in classes ) classes[mainClass] = '';

        expect(classes).toEqual(defaultClasses);

        const classesKeys = Object.keys(classes);
        const defaultClassesKeys = Object.keys(defaultClasses);

        for ( let i = 0; i < classesKeys.length; i++ ) {
            expect(classesKeys[i]).toBe(defaultClassesKeys[i]);
        }
    });
});