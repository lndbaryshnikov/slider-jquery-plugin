import SliderView from "../../src/MVP modules/Slider/SliderView";
import SliderModel from "../../src/MVP modules/Slider/SliderModel";
import {getClassList} from "../../src/functions/private/view.private";

describe('destroy and cleanDom methods', () => {
    let sliderView: SliderView, root: HTMLElement;

    const defaultOptions = new SliderModel().defaultOptions;

    beforeEach(() => {
        sliderView = new SliderView();

        sliderView.setOptions(defaultOptions);

        root = document.body;

        sliderView.render(root);
    });

    test("cleanDom method works correctly", () => {
        sliderView.cleanDom();

        expect(document.querySelectorAll('div').length).toBe(0);
        expect(document.querySelector('.jquery-slider')).toBe(null);
        expect(document.querySelector('.jquery-slider-range')).toBe(null);
        expect(document.querySelector('.jquery-slider-handle')).toBe(null);
    });

    test("destroy method works", () => {
        sliderView.destroy();

        expect(sliderView.html).toBe(undefined);
        expect(document.querySelectorAll('div').length).toBe(3);
        expect(getClassList($('div'))).toEqual(defaultOptions.classes);
    });
});