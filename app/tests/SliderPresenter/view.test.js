import SliderPresenter from "../../src/MVP modules/Slider/presenter";
import SliderView from "../../src/MVP modules/Slider/_view";
import SliderModel from "../../src/MVP modules/Slider/_model";

test("_view property should return an object", () => {

    const view = new SliderPresenter(new SliderView(), new SliderModel())._view;
    expect(typeof view).toBe('object');

});