import SliderModel, {defaultOptions} from "../../src/MVP modules/Slider/_model";

import clone from '../../src/functions/common/objectCopy';
Object.clone = clone;

describe("Options object extension(getOptions method)", () => {

    test("extends object when user changes classes", () => {

        const modelOptions = (new SliderModel({
            classes: {
                "jquery-slider-range": "my-slider-range"
            }
        }))._options;

        const testOptions = Object.clone(defaultOptions);
        testOptions.classes = {
            "jquery-slider-range": "my-slider-range"
        };

        expect(modelOptions).toEqual(testOptions);
    });

    test("extends object with max = 60 and min = 20", () => {

        const modelOptions = (new SliderModel({min: 20, max: 60}))._options;

        const testOptions = Object.assign({}, defaultOptions);

        testOptions.min = 20;
        testOptions.max = 60;

        expect(modelOptions).toEqual(testOptions);
    });

    test("returns initial object when user changes nothing", () => {

        const modelOptions = (new SliderModel())._options;

        expect(modelOptions).toEqual(defaultOptions);
    });
});