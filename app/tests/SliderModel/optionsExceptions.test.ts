import SliderModel, {Options} from "../../src/MVP modules/Slider/SliderModel";
import SliderPresenter from "../../src/MVP modules/Slider/SliderPresenter";
import SliderView from "../../src/MVP modules/Slider/SliderView";

var createSliderCallback = (options: any) => {
    return () => {
        const slider  = new SliderPresenter(new SliderView(), new SliderModel());
        slider.setUp(options);
    };
};

describe('Throwing exception when user passes incorrect _options', () => {

    test("throws error when userOptions isn't an object", () => {

        expect(createSliderCallback('options')).toThrow('Options are incorrect' +
            '(should be an object)');
    });

    test("throws error when userOptions object doesn't correspond the required format", () => {

        const createWrongModel = createSliderCallback({
            minimal: 100,
            sweetness: 35
        });

        expect(createWrongModel).toThrow('Options are incorrect' +
            '(should correspond the required format)');
    });

    test("throws error when user passes wrong class _options", () => {

        const createWrongModel = createSliderCallback({
            classes: {
                'jquery-sl': 'my-slider'
            }
        });

        expect(createWrongModel).toThrow('Options are incorrect' +
            '(classes should correspond the required format)');
    });

});