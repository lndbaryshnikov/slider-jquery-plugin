//import expect from 'chai'
import clone from '../src/functions/common/objectCopy'
Object.clone = clone;

import Model from '../src/MVP modules/model/model'
import {createModel} from "../src/functions/private/model.private";
import {defaultOptions} from '../src/MVP modules/model/model'

describe('Model', () => {

    describe("Options object extension(getOptions method)", () => {

        test("extends object when user changes classes", () => {

            const modelOptions = (new Model({
                classes: {
                    "jquery-slider-range": "my-slider-range"
                }
            })).options;

            const testOptions = Object.clone(defaultOptions);
            testOptions.classes = {
                "jquery-slider-range": "my-slider-range"
            };

            expect(modelOptions).toEqual(testOptions);
        });

        test("extends object with max = 60 and min = 20", () => {

            const modelOptions = (new Model({min: 20, max: 60})).options;

            const testOptions = Object.assign({}, defaultOptions);

            testOptions.min = 20;
            testOptions.max = 60;

            expect(modelOptions).toEqual(testOptions);
        });

        test("returns initial object when user changes nothing", () => {

            const modelOptions = (new Model()).options;

            expect(modelOptions).toEqual(defaultOptions);
        });

    });

    describe('Throwing exception when user passes incorrect options', () => {
        
        test("throws error when userOptions isn't an object", () => {

            expect(createModel('options')).toThrow('Options are incorrect' +
                '(should be an object)');
        });
        
        test("throws error when userOptions object doesn't correspond the required format", () => {

            const createWrongModel = createModel({
                minimal: 100,
                sweetness: 35
            });

            expect(createWrongModel).toThrow('Options are incorrect' +
                '(should correspond the required format)');
        });

        test("throws error when user passes wrong class options", () => {

            const createWrongModel = createModel({
                classes: {
                    'jquery-sl': 'my-slider'
                }
            });

            expect(createWrongModel).toThrow('Options are incorrect' +
                '(classes should correspond the required format)');
        });

    })

});