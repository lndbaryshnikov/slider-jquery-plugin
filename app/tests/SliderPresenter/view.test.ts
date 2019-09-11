import SliderPresenter from "../../src/MVP modules/Slider/SliderPresenter";
import SliderView from "../../src/MVP modules/Slider/SliderView";
import SliderModel from "../../src/MVP modules/Slider/SliderModel";

test("view property should return an object", () => {

    const view = new SliderPresenter(new SliderView(), new SliderModel()).view;
    expect(typeof view).toBe('object');

});