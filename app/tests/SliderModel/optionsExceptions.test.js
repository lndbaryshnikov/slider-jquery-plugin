import {createModel} from "../../src/functions/private/model.private";

describe('Throwing exception when user passes incorrect _options', () => {

    test("throws error when userOptions isn't an object", () => {

        expect(createModel('_options')).toThrow('Options are incorrect' +
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

    test("throws error when user passes wrong class _options", () => {

        const createWrongModel = createModel({
            classes: {
                'jquery-sl': 'my-slider'
            }
        });

        expect(createWrongModel).toThrow('Options are incorrect' +
            '(classes should correspond the required format)');
    });

});