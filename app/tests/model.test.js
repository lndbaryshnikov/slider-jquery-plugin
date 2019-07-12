//import expect from 'chai'
import clone from '../src/objectCopy'
Object.clone = clone;

import {Model} from '../src/MVP modules/model/model'
import {createModel} from "../src/private/model.private";
import {defaultOptions} from '../src/MVP modules/model/model'

describe('Model', () => {

    describe("Options object extension(getOptions method)", () => {

        it("extends object when user changes classes", function () {

            const modelOptions = (new Model({
                classes: {
                    "jquery-slider-range": "my-slider-range"
                }
            })).options;

            const testOptions = Object.clone(defaultOptions);
            testOptions.classes = {
                "jquery-slider-range": "my-slider-range"
            };

            expect(modelOptions).to.deep.equal(testOptions);
        });

        it("extends object with max = 60 and min = 20", function () {

            const modelOptions = (new Model({min: 20, max: 60})).options;

            const testOptions = Object.assign({}, defaultOptions);

            testOptions.min = 20;
            testOptions.max = 60;

            expect(modelOptions).to.deep.equal(testOptions);
        });

        it("returns initial object when user changes nothing", function () {

            const modelOptions = (new Model()).options;

            expect(modelOptions).to.deep.equal(defaultOptions);
        });

    });

    describe('Throwing exception when user passes incorrect options', () => {
        
        it("throws error when userOptions isn't an object", () => {

            expect(createModel('options')).to.throw('Options are incorrect' +
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

        it("throws error when user passes wrong class options", () => {

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