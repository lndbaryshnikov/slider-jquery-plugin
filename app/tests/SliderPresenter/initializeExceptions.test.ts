import SliderPresenter from "../../src/MVP modules/Slider/SliderPresenter";
import SliderView from "../../src/MVP modules/Slider/SliderView";
import SliderModel from "../../src/MVP modules/Slider/SliderModel";

describe('initialize exceptions', () => {
    let slider: SliderPresenter;

    beforeEach(() => {
       slider = new SliderPresenter(new SliderView(), new SliderModel());

    });

    test("throws exceptions when render without setup", () => {
        expect(() => { slider.render(document.body) }).toThrow('Slider isn\'t setUp');
    });

    test("throws exception when setUp when slider already setUp", () => {
        slider.setUp();

        expect(() => { slider.setUp() }).toThrow('Slider is already setUp');
    });

    test("throws exception when destroy without initialize", () => {
        expect(() => { slider.destroy() }).toThrow('Slider isn\'t initialized yet');
    });
});
