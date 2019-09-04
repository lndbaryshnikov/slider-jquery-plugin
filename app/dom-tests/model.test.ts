import { expect } from 'chai'
import clone from '../src/functions/common/objectCopy'

interface ObjectNew extends ObjectConstructor {
    clone(obj: any): any
}

declare const Object: ObjectNew;

Object.clone = clone;

import SliderModel from '../src/MVP modules/Slider/_model'
import {createModel, Options} from "../src/functions/private/model.private";
import {defaultOptions} from '../src/MVP modules/Slider/_model'



describe('SliderModel', () => {
    describe("Options object extension(getOptions method)", () => {
        it("extends object when user changes classes",  () => {
            const modelOptions = (new SliderModel({
                classes: {
                    "jquery-slider-range": "my-slider-range"
                }
            }))._options;

            const testOptions = Object.clone(defaultOptions);
            testOptions.classes = {
                "jquery-slider-range": "my-slider-range"
            };

            expect(modelOptions).to.deep.equal(testOptions);
        });

        it("extends object with max = 60 and min = 20",  () => {
            const modelOptions = (new SliderModel({min: 20, max: 60}))._options;

            const testOptions = Object.assign({}, defaultOptions);

            testOptions.min = 20;
            testOptions.max = 60;

            expect(modelOptions).to.deep.equal(testOptions);
        });

        it("returns initial object when user changes nothing",  () => {
            const modelOptions = (new SliderModel())._options;

            expect(modelOptions).to.deep.equal(defaultOptions);
        });

    });

    describe('Throwing exception when user passes incorrect _options', () => {
        it("throws error when userOptions isn't an object", () => {
            expect(createModel('_options')).to.throw('Options are incorrect' +
                '(should be an object)');
        });
        
        it("throws error when userOptions object doesn't correspond the required format", () => {
            const createWrongModel = createModel({
                minimal: 100,
                sweetness: 35
            });

            expect(createWrongModel).to.throw('Options are incorrect' +
                '(should correspond the required format)');
        });

        it("throws error when user passes wrong class _options", () => {
            const createWrongModel = createModel({
                classes: {
                    'jquery-sl': 'my-slider'
                }
            });

            expect(createWrongModel).to.throw('Options are incorrect' +
                '(classes should correspond the required format)');
        });
    })
});