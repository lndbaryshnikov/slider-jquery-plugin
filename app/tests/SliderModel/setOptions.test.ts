import SliderModel, {Options, UserOptions} from "../../src/MVP modules/Slider/SliderModel";

describe("When options object is passed", () => {
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

            expect((model.getOptions() as Options).orientation).toBe(orientation);
            expect(`jquery-slider jquery-slider-${orientation}`
                in (model.getOptions() as Options).classes).toBeTruthy();
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

        const classes = (model.getOptions() as Options).classes;
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

        expect((model.getOptions() as Options).min).toBe(30);
        expect((model.getOptions() as Options).range).toBe('min');
        expect((model.getOptions() as Options).classes).toEqual(SliderModel.getDefaultOptions('horizontal').classes);

        model.setOptions({
            max: 154,
            min: 13,
            range: "max",
            orientation: "vertical"
        });

        expect((model.getOptions() as Options).min).toBe(13);
        expect((model.getOptions() as Options).max).toBe(154);
        expect((model.getOptions() as Options).range).toBe('max');
        expect((model.getOptions() as Options).orientation).toBe('vertical');
        expect((model.getOptions() as Options).classes).toEqual(SliderModel.getDefaultOptions('vertical').classes);
    });

    test("extension when one option passed", () => {
        model.setOptions();
        model.setOptions('value', 34);

        const customDefaults = SliderModel.getDefaultOptions('horizontal');
        customDefaults.value = 34;

        expect(model.getOptions()).toEqual(customDefaults);
        expect((model.getOptions() as Options).value).toBe(34);

        model.setOptions("classes", {
            'jquery-slider': 'my-slider'
        } as UserOptions[keyof UserOptions]);

        expect(model.getOptions("classes")).toEqual({
            'jquery-slider jquery-slider-horizontal': 'my-slider',
            'jquery-slider-range': '',
            'jquery-slider-handle': ''
        });
    });

    test("classes extension by one-options extension", () => {
        model.setOptions();
        model.setOptions("classes", "jquery-slider", "my-slider");

        expect(model.getOptions("classes")).toEqual({
            'jquery-slider jquery-slider-horizontal': 'my-slider',
            'jquery-slider-range': '',
            'jquery-slider-handle': ''
        });

        expect(model.getOptions("classes", "jquery-slider" as keyof Options["classes"])).toBe("my-slider");

        model.setOptions("orientation", "vertical");

        expect(model.getOptions("orientation")).toBe("vertical");

        expect(model.getOptions("classes")).toEqual({
            'jquery-slider jquery-slider-vertical': 'my-slider',
            'jquery-slider-range': '',
            'jquery-slider-handle': ''
        });

        model.setOptions("classes", {
            'jquery-slider': '',
            'jquery-slider-range': 'my-range',
            'jquery-slider-handle': ''
        });

        expect(model.getOptions("classes")).toEqual({
            'jquery-slider jquery-slider-vertical': '',
            'jquery-slider-range': 'my-range',
            'jquery-slider-handle': ''
        });

        model.setOptions("classes", "jquery-slider-range", "new-slider");

        expect(model.getOptions("classes")).toEqual({
            'jquery-slider jquery-slider-vertical': '',
            'jquery-slider-range': 'new-slider',
            'jquery-slider-handle': ''
        });

        model.setOptions("classes", "jquery-slider", "second-slider");

        expect(model.getOptions("classes")).toEqual({
            'jquery-slider jquery-slider-vertical': 'second-slider',
            'jquery-slider-range': 'new-slider',
            'jquery-slider-handle': ''
        });

        model.setOptions("classes", {
            'jquery-slider': '',
            'jquery-slider-range': '',
            'jquery-slider-handle': 'my-handle'
        });

        expect(model.getOptions("classes")).toEqual({
            'jquery-slider jquery-slider-vertical': '',
            'jquery-slider-range': '',
            'jquery-slider-handle': 'my-handle'
        });
    });

    // test("value sets correctly when options are not default (equals 'min')", () => {
    //     model.setOptions( { min: 34, max: 156 } );
    //
    //     expect(model.getOptions("value")).toBe(34);
    // });
});