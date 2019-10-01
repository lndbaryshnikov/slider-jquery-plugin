import SliderView from "../../src/MVP modules/Slider/SliderView";
import SliderModel from "../../src/MVP modules/Slider/SliderModel";

describe("tooltip exists on dom and contains 'value'", () => {
   let view: SliderView;

    beforeEach(() => {
        view = new SliderView();

        const defaultsWithTooltip = SliderModel.getDefaultOptions("horizontal");

        defaultsWithTooltip.tooltip = true;

        view.setOptions(defaultsWithTooltip);

        view.render(document.body);

        const handle = document.querySelector(".jquery-slider-handle");
        const tooltip = document.querySelector(".jquery-slider-tooltip");

        expect(!!tooltip).toBeTruthy();
        expect(handle.contains(tooltip)).toBeTruthy();
        expect(tooltip.innerHTML).toBe(0);

        const defaultsWIthAnotherValue = SliderModel.getDefaultOptions("horizontal");
        defaultsWIthAnotherValue.value = 50;

        view.setOptions(defaultsWIthAnotherValue);

        expect(tooltip.innerHTML).toBe(50);
    });
});