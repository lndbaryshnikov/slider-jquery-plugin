import {createInstance, getClassList} from "../../src/functions/private/view.private";
import $ from "jquery";

import {defaultOptions} from '../../src/MVP modules/model/model';

const defaultClasses = defaultOptions.classes;

describe("setModel method for setting classes", () => {
    test("set classes when user passes no classes in model", () => {
        const app = createInstance();

        app.createDom();

        expect(getClassList($('div'))).toEqual(defaultClasses);

        app.removeDom();
    });

    test("set classes when user adds extra class 'my-slider' to 'jquery-slider' class", () => {
        const app = createInstance({
            classes: {
                'jquery-slider': 'my-slider'
            }
        });

        app.createDom();

        const domClasses = getClassList($('div'));

        const testClasses = Object.assign({}, defaultClasses);
        testClasses["jquery-slider"] = 'my-slider';

        expect($('.jquery-slider').hasClass('my-slider')).toBe(true);
        expect(domClasses).toEqual(testClasses);

        app.removeDom();
    });
});