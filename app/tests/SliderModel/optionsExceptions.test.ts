import SliderModel, {UserOptions} from "../../src/MVP modules/Slider/SliderModel";
import SliderPresenter from "../../src/MVP modules/Slider/SliderPresenter";
import SliderView from "../../src/MVP modules/Slider/SliderView";

const model = new SliderPresenter(new SliderView(), new SliderModel());

describe('Throwing exception when user passes incorrect _options', () => {

    test("throws error when userOptions isn't an object", () => {
        expect(( ) => { model.setOptions('options' as UserOptions); }).toThrow('Options are incorrect' +
            '(should be an object)');
    });

    test("throws error when userOptions object doesn't correspond the required format", () => {
        expect(( ) => { model.setOptions( {minimal: 100, sweetness: 35} as UserOptions); })
            .toThrow('Options are incorrect(should correspond the required format)');
    });

    test("throws error when user passes wrong class _options", () => {
        expect(( ) => { model.setOptions( {classes: { 'jquery-sl': 'my-slider' }} as UserOptions); })
            .toThrow('Options are incorrect(classes should correspond the required format)');
    });

    test("throws error when user adds whitespaces in slider's main classes", () => {
        expect(( ) => { model.setOptions( {classes: {
                'jquery-slider  ': 'slider',
                '  jquery-slider-range  ': 'range'
            }} as UserOptions) })
        .toThrow('Options are incorrect(main classes shouldn\'t have extra whitespaces)');
    });

    test("throws an exception when options.orientation is incorrect", () => {
        expect(( ) => { model.setOptions({ orientation: "horizontal " as "horizontal"}); })
            .toThrow('Options are incorrect (for orientation only ' +
                '"vertical" and "horizontal" values are allowed)');

        expect(( ) => { model.setOptions({ orientation: "high " as "vertical"}); })
            .toThrow('Options are incorrect (for orientation only ' +
                '"vertical" and "horizontal" values are allowed)');
    });

});