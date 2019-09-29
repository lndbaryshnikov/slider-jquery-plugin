import SliderModel, {Options} from "../../src/MVP modules/Slider/SliderModel";
import SliderPresenter from "../../src/MVP modules/Slider/SliderPresenter";
import SliderView from "../../src/MVP modules/Slider/SliderView";

describe('getOptions method', () => {
    let slider: SliderPresenter;
    let errors = SliderModel.optionsErrors;

    beforeEach(() => {
        slider = new SliderPresenter(new SliderView(), new SliderModel());
    });

    test("throws exception when options are not set", () => {
       expect(() => {
           slider.getOptions();
       }).toThrow("Options are not set");
    });

    test("return options object when no arguments passed", () => {
        slider.setOptions();

        expect(slider.getOptions()).toEqual(SliderModel.getDefaultOptions('horizontal'));
    });

    test("return single option when only option name is provided", () => {
       slider.setOptions();

       expect(slider.getOptions('max')).toBe(SliderModel.getDefaultOptions('horizontal').max);
       expect(slider.getOptions('classes')).toEqual(SliderModel.getDefaultOptions('horizontal').classes)
    });

    test("throws exception when incorrect options name provided", () => {
        slider.setOptions();

        expect(( ) => {
            slider.getOptions('minimal' as keyof Options);
        }).toThrow(errors.options.notExisting("minimal"));
    });

    test("return desires class", () => {
        slider.setOptions({
            classes: {
                "jquery-slider-range": "my-range",
                "jquery-slider-handle": "my-handle",
            }
        });

        expect(slider.getOptions( 'classes', 'jquery-slider' as keyof Options['classes'] ))
            .toBe("");
        expect(slider.getOptions( 'classes', 'jquery-slider-range' as keyof Options['classes'] ))
            .toBe("my-range");
    });

    test("throws exception when class name is incorrect", () => {
        slider.setOptions();

        expect(( ) => {
            slider.getOptions('classes', 'jquery-slider jquery-slider-horizontal' as keyof Options['classes']);
        }).toThrow(errors.classes.notExisting("jquery-slider jquery-slider-horizontal"));

        expect(( ) => {
            slider.getOptions('classes', 'jquery-slider-my-range' as keyof Options['classes']);
        }).toThrow(errors.classes.notExisting("jquery-slider-my-range"));
    });

    test("throws exception when 2 arguments provided: option and class, but option is not 'classes'", () => {
        slider.setOptions();

        expect(() => {
            slider.getOptions('min', "jquery-slider-handle");
        }).toThrow(errors.classes.contains);
    });

    test("throws exception when options are not set", () => {
        expect(( ) => {
            slider.getOptions();
        }).toThrow(errors.notSet);
    });
});