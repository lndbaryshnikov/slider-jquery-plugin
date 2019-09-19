import SliderModel from "../../src/MVP modules/Slider/SliderModel";

describe("Options object extension(getOptions method)", () => {
    let model: SliderModel;

    beforeEach(() => {
       model = new SliderModel();
    });

    test("extends object when main changes classes", () => {
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
        model.setOptions({min: 20, max: 60});

        const testOptions = $.extend(true, {}, SliderModel.getDefaultOptions('horizontal'));

        testOptions.min = 20;
        testOptions.max = 60;

        expect(model.getOptions()).toEqual(testOptions);
    });

    test("options are undefined when main passes no options", () => {
        expect(model.getOptions()).toEqual(null);
    });

    test("options.classes and options.orientation depending on orientation", () => {
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

    test("extension when options are already set", () => {
        model.setOptions({
            min: 30,
            range: "min"
        });

        expect(model.getOptions().min).toBe(30);
        expect(model.getOptions().range).toBe('min');
        expect(model.getOptions().classes).toEqual(SliderModel.getDefaultOptions('horizontal').classes);

        model.setOptions({
            max: 154,
            min: 13,
            range: "max",
            orientation: "vertical"
        });

        expect(model.getOptions().min).toBe(13);
        expect(model.getOptions().max).toBe(154);
        expect(model.getOptions().range).toBe('max');
        expect(model.getOptions().orientation).toBe('vertical');
        expect(model.getOptions().classes).toEqual(SliderModel.getDefaultOptions('vertical').classes);
    });
});