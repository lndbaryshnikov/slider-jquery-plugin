import SliderModel, {Options, UserOptions} from "../../src/MVP modules/Slider/SliderModel";
import SliderPresenter from "../../src/MVP modules/Slider/SliderPresenter";
import SliderView from "../../src/MVP modules/Slider/SliderView";

const sliderPresenter = new SliderPresenter(new SliderView(), new SliderModel());

const errors = SliderModel.optionsErrors;

test("throws error when userOptions isn't an object", () => {
    expect(( ) => { sliderPresenter.setOptions('options' as UserOptions); })
        .toThrow(errors.incorrectOptions);
});

test("throws error when userOptions object doesn't correspond the required format", () => {
    expect(( ) => { sliderPresenter.setOptions( {minimal: 100, sweetness: 35} as UserOptions); })
        .toThrow(errors.incorrectOptionsObject);
});

test("throws error when main passes wrong class _options", () => {
    expect(( ) => { sliderPresenter.setOptions( {classes: { 'jquery-sl': 'my-slider' }} as UserOptions); })
        .toThrow(errors.classes.incorrectFormat);
});

test("throws error when main adds whitespaces in slider's main classes", () => {
    expect(( ) => { sliderPresenter.setOptions( {classes: {
            'jquery-slider  ': 'slider',
            '  jquery-slider-range  ': 'range'
        }} as UserOptions) })
    .toThrow(errors.classes.extraWs);
});

test("throws an exception when options.orientation is incorrect", () => {
    expect(( ) => { sliderPresenter.setOptions({ orientation: "horizontal " as "horizontal"}); })
        .toThrow(errors.orientation.incorrect);

    expect(( ) => { sliderPresenter.setOptions({ orientation: "high " as "vertical"}); })
        .toThrow(errors.orientation.incorrect);
});

test("extension of singe option when options are not set", () => {
    expect(( ) => { sliderPresenter.setOptions("max", 35); })
        .toThrow(errors.notSet);
});

test("throws an exceptions when custom class is not of string type", () => {
    expect(( ) => { sliderPresenter.setOptions({
        classes: {
            "jquery-slider-handle": 34 as unknown as string
        }
    }) }).toThrow(errors.options.incorrectType("classes", "string"));
});

test("throws extension when range option is incorrect", () => {
    expect(() => { sliderPresenter.setOptions({ range: "maximum" as Options["range"] }) })
        .toThrow(errors.range.incorrect);
});

test("passing no options when options are already set", () => {
    expect(( ) => {
        sliderPresenter.setOptions();
        sliderPresenter.setOptions();
    })
        .toThrow(errors.alreadySet);
});

describe("One option extension when options are set", () => {
    let sliderPresenter: SliderPresenter;

    beforeEach(() => {
        sliderPresenter = new SliderPresenter(new SliderView(), new SliderModel());

        sliderPresenter.setOptions();
    });

    test("extension of single option when options does not exist", () => {
        expect(( ) => { sliderPresenter.setOptions("maximum" as keyof Options, 36) })
            .toThrow(errors.options.notExisting("maximum"));
    });

    test("extension of single parameter (not classes) when 3 arguments provided", () => {
        expect(() => { sliderPresenter.setOptions("max", "top", 35); })
            .toThrow(errors.classes.twoExtra);
    });

    test("single class extension when provided main class does not exist", () => {
        expect(( ) => { sliderPresenter.setOptions("classes", "my-jq-slider", "slider"); })
            .toThrow(errors.classes.notExisting("my-jq-slider"));
    });

    test("extension of single class when custom class is not of string type", () => {
        expect(( ) => { sliderPresenter.setOptions("classes", "jquery-slider", 34) })
            .toThrow(errors.classes.customIsNotString);
    });

    test("throws extension when type of 'min', 'max', 'step' or 'value' is not 'string'", () => {
        const checkStringType = (type: 'min' | 'max' | 'step' | 'value') => {
            expect( ( ) => { sliderPresenter.setOptions(type, "34"); })
                .toThrow(errors.options.incorrectType(type, "number"))
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
        }).toThrow(errors.value.beyond);
    });

    test("throws exception when 'max', as single option passes, less that 'value'", () => {
        expect(( ) => {
            sliderPresenter.setOptions( { value: 40 } );
            sliderPresenter.setOptions("max", 30);
        }).toThrow(errors.minAndMax.lessOrMore("max", "less"));
    });

    test("throws exception when 'min', as single option passes, more than 'value'", () => {
        expect(( ) => {
            sliderPresenter.setOptions( { value: 50, max: 120 } );
            sliderPresenter.setOptions("min", 60);
        }).toThrow(errors.minAndMax.lessOrMore("min", "more"));
    });
    
    test("throws exception when 'value', 'min' or 'max' are incorrect", () => {
        const error = errors.value.beyond;

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