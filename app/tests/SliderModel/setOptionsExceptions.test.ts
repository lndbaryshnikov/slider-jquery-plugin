import SliderModel, {Options, UserOptions} from "../../src/MVP modules/Slider/SliderModel";
import SliderPresenter from "../../src/MVP modules/Slider/SliderPresenter";
import SliderView from "../../src/MVP modules/Slider/SliderView";

const sliderPresenter = new SliderPresenter(new SliderView(), new SliderModel());

test("throws error when userOptions isn't an object", () => {
    expect(( ) => { sliderPresenter.setOptions('options' as UserOptions); })
        .toThrow("Incorrect options (should be object or key - value pairs)");
});

test("throws error when userOptions object doesn't correspond the required format", () => {
    expect(( ) => { sliderPresenter.setOptions( {minimal: 100, sweetness: 35} as UserOptions); })
        .toThrow('Options are incorrect(should correspond the required format)');
});

test("throws error when main passes wrong class _options", () => {
    expect(( ) => { sliderPresenter.setOptions( {classes: { 'jquery-sl': 'my-slider' }} as UserOptions); })
        .toThrow('Options are incorrect(classes should correspond the required format)');
});

test("throws error when main adds whitespaces in slider's main classes", () => {
    expect(( ) => { sliderPresenter.setOptions( {classes: {
            'jquery-slider  ': 'slider',
            '  jquery-slider-range  ': 'range'
        }} as UserOptions) })
    .toThrow('Options are incorrect(main classes shouldn\'t have extra whitespaces)');
});

test("throws an exception when options.orientation is incorrect", () => {
    expect(( ) => { sliderPresenter.setOptions({ orientation: "horizontal " as "horizontal"}); })
        .toThrow('Options are incorrect (for orientation only ' +
            '"vertical" and "horizontal" values are allowed)');

    expect(( ) => { sliderPresenter.setOptions({ orientation: "high " as "vertical"}); })
        .toThrow('Options are incorrect (for orientation only ' +
            '"vertical" and "horizontal" values are allowed)');
});

test("extension of singe option when options are not set", () => {
    expect(( ) => { sliderPresenter.setOptions("max", 35); })
        .toThrow("Options are not set (to set options pass options object)");
});

test("throws an exceptions when custom class is not of string type", () => {
    expect(( ) => { sliderPresenter.setOptions({
        classes: {
            "jquery-slider-handle": 34 as unknown as string
        }
    }) }).toThrow("Options are incorrect (classes should be typeof string)");
});

test("throws extension when range option is incorrect", () => {
    expect(() => { sliderPresenter.setOptions({ range: "maximum" as Options["range"] }) })
        .toThrow("Options are incorrect (Option 'range' " +
            "can only be 'min', 'max' or typeof 'boolean')");
});

test("passing no options when options are already set", () => {
    expect(( ) => {
        sliderPresenter.setOptions();
        sliderPresenter.setOptions();
    })
        .toThrow("Options are already set (to change - provide options)");
});

describe("One option extension when options are set", () => {
    let sliderPresenter: SliderPresenter;

    beforeEach(() => {
        sliderPresenter = new SliderPresenter(new SliderView(), new SliderModel());

        sliderPresenter.setOptions();
    });

    test("extension of single option when options does not exist", () => {
        expect(( ) => { sliderPresenter.setOptions("maximum" as keyof Options, 36) })
            .toThrow("Option \"maximum\" doesn't exist");
    });

    test("extension of single parameter (not classes) when 3 arguments provided", () => {
        expect(() => { sliderPresenter.setOptions("max", "top", 35); })
            .toThrow('Only option "classes" can have two extra arguments');
    });

    test("single class extension when provided main class does not exist", () => {
        expect(( ) => { sliderPresenter.setOptions("classes", "my-jq-slider", "slider"); })
            .toThrow("Class 'my-jq-slider' doesn't exist");
    });

    test("extension of single class when custom class is not of string type", () => {
        expect(( ) => { sliderPresenter.setOptions("classes", "jquery-slider", 34) })
            .toThrow('Class is incorrect (should be a string)');
    });

    test("throws extension when type of 'min', 'max', 'step' or 'value' is not 'string'", () => {
        const checkStringType = (type: 'min' | 'max' | 'step' | 'value') => {
            expect( ( ) => { sliderPresenter.setOptions(type, "34"); })
                .toThrow(`Options are incorrect (option '${type}' should be of type 'number'`)
        };

        checkStringType("min");
        checkStringType("max");
        checkStringType("step");
        checkStringType("value");
    });
    
    test("throws exception when value, as single option passes, goes beyond min and max", () => {
        expect(( ) => {
            sliderPresenter.setOptions( { min: 30, max: 120, value: 40 } );
            sliderPresenter.setOptions("value", 20);
        }).toThrow("Options are incorrect ('value' cannot go beyond 'min' and 'max')");
    });

    test("throws exception when 'max', as single option passes, less that 'value'", () => {
        expect(( ) => {
            sliderPresenter.setOptions( { value: 40 } );
            sliderPresenter.setOptions("max", 30);
        }).toThrow("Options are incorrect (option 'max' cannot be less than 'value')");
    });

    test("throws exception when 'min', as single option passes, more than 'value'", () => {
        expect(( ) => {
            sliderPresenter.setOptions( { value: 50, max: 120 } );
            sliderPresenter.setOptions("min", 60);
        }).toThrow("Options are incorrect (option 'min' cannot be more than 'value')");
    });
    
    test("throws exception when 'value', 'min' or 'max' are incorrect", () => {
        const error = "Options are incorrect ('value' should be between 'min' and 'max' values)";

        expect( ( ) => {
            sliderPresenter.setOptions( { value: 150 } );
        }).toThrow(error);

        expect( ( ) => {
            sliderPresenter.setOptions( { min: 10 } );
        }).toThrow(error);

        expect( ( ) => {
            sliderPresenter.setOptions( { value: 50, min: 10, max: 45 } );
        }).toThrow(error);

        expect( ( ) => {
            sliderPresenter.setOptions( { value: 50, max: 100, min: 60 } );
        }).toThrow(error);
    });
});