import SliderModel, {Options} from "../../src/MVP modules/Slider/SliderModel";
import SliderPresenter from "../../src/MVP modules/Slider/SliderPresenter";
import SliderView from "../../src/MVP modules/Slider/SliderView";

describe('getOptions method', () => {
    let slider: SliderPresenter;

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

       expect(slider.getOptions('max')).toEqual(SliderModel.getDefaultOptions('horizontal').max);
       expect(slider.getOptions('classes')).toEqual(SliderModel.getDefaultOptions('horizontal').classes)
    });

    test("throws exception when incorrect options name provided", () => {
        slider.setOptions();

        expect(() => {
            slider.getOptions('minimal' as keyof Options)
        }).toThrow('Option "minimal" doesn\'t exist');
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
        }).toThrow('Class "jquery-slider jquery-slider-horizontal" does not exist');

        expect(( ) => {
            slider.getOptions('classes', 'jquery-slider-my-range' as keyof Options['classes']);
        }).toThrow('Class "jquery-slider-my-range" does not exist');
    });

    test("throws exception when 2 arguments provided: option and class, but option is not 'classes'", () => {
        slider.setOptions();

        expect(() => {
            slider.getOptions('min', "jquery-slider-handle");
        }).toThrow('Only option "classes" contains classes');
    });
});