import SliderView from "../../src/MVP modules/Slider/SliderView";
import SliderModel from "../../src/MVP modules/Slider/SliderModel";
import SliderTooltipView from "../../src/MVP modules/SliderTooltipView";

describe("tooltip exists on dom and contains 'value'", () => {
   let view: SliderView;
   let tooltipView = new SliderTooltipView();

    beforeEach(() => {
        view = new SliderView();
    });

    test("tooltip rendered correctly", () => {
        const defaultsWithTooltip = SliderModel.getDefaultOptions("horizontal");

        defaultsWithTooltip.tooltip = true;

        tooltipView.init(defaultsWithTooltip.value,
            defaultsWithTooltip.orientation);

        view.setOptions(defaultsWithTooltip, tooltipView);

        view.render(document.body);

        const handle = document.querySelector(".jquery-slider-handle");
        const tooltip = document.querySelector(".jquery-slider-tooltip");

        expect(!!tooltip).toBeTruthy();
        expect(handle.contains(tooltip)).toBeTruthy();
        expect(tooltip.innerHTML).toBe("0");

        const defaultsWIthAnotherValue = SliderModel.getDefaultOptions("horizontal");
        defaultsWIthAnotherValue.value = 50;

        tooltipView.init(defaultsWIthAnotherValue.value,
            defaultsWithTooltip.orientation);

        view.setOptions(defaultsWIthAnotherValue, tooltipView);

        expect(tooltip.innerHTML).toBe("50");
    });
});