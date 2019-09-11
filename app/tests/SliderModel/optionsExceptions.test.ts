import SliderModel from "../../src/MVP modules/Slider/SliderModel";
import SliderPresenter from "../../src/MVP modules/Slider/SliderPresenter";
import SliderView from "../../src/MVP modules/Slider/SliderView";

const createSetOptionsCallback = (options: any) => {
    return () => {
        const model  = new SliderPresenter(new SliderView(), new SliderModel());
        model.setUp(options);
    };
};

describe('Throwing exception when user passes incorrect _options', () => {

    test("throws error when userOptions isn't an object", () => {

        expect(createSetOptionsCallback('options')).toThrow('Options are incorrect' +
            '(should be an object)');
    });

    test("throws error when userOptions object doesn't correspond the required format", () => {

        const createWrongOptions = createSetOptionsCallback({
            minimal: 100,
            sweetness: 35
        });

        expect(createWrongOptions).toThrow('Options are incorrect' +
            '(should correspond the required format)');
    });

    test("throws error when user passes wrong class _options", () => {

        const createWrongOptions = createSetOptionsCallback({
            classes: {
                'jquery-sl': 'my-slider'
            }
        });

        expect(createWrongOptions).toThrow('Options are incorrect' +
            '(classes should correspond the required format)');
    });

    test("throws error when user adds whitespaces in slider's main classes", () => {
        const createWrongOptions = createSetOptionsCallback({
            classes: {
                'jquery-slider  ': 'slider',
                '  jquery-slider-range  ': 'range'
            }
        });

        expect(createWrongOptions).toThrow('Options are incorrect(main classes shouldn\'t have extra whitespaces)');
    });

});