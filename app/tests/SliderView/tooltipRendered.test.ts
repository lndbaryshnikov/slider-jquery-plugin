import SliderView from "../../src/MVP modules/Slider/SliderView";
import SliderModel from "../../src/MVP modules/Slider/SliderModel";
import SliderTooltipView from "../../src/MVP modules/SliderTooltipView";

describe("tooltip exists on dom and contains 'value'", () => {
   let view: SliderView;
   const tooltipView = new SliderTooltipView();

    const defaultsWithTooltip = SliderModel.getDefaultOptions("horizontal");
    defaultsWithTooltip.tooltip = true;

    beforeEach(() => {
        view = new SliderView();
    });

    test("tooltip rendered correctly", () => {
        tooltipView.setOptions(
            defaultsWithTooltip.value,
            defaultsWithTooltip.orientation,
        );

        view.setOptions(defaultsWithTooltip);

        view.render(document.body);
        view.renderPlugin("tooltip", tooltipView);

        const handle = document.querySelector(".jquery-slider-handle");
        const tooltip = document.querySelector(".jquery-slider-tooltip");


        expect(!!tooltip).toBeTruthy();
        expect(handle.contains(tooltip)).toBeTruthy();
        expect(tooltip.innerHTML).toBe("0");

        const defaultsWIthAnotherValue = SliderModel.getDefaultOptions("horizontal");
        defaultsWIthAnotherValue.value = 50;

        tooltipView.setOptions(defaultsWIthAnotherValue.value,
            defaultsWithTooltip.orientation);

        view.setOptions(defaultsWIthAnotherValue);

        expect(tooltip.innerHTML).toBe("50");
    });

    test("tooltip rendered correctly with function for value", () => {
        const defaultsWithTooltipFunction = SliderModel.getDefaultOptions("horizontal");
        defaultsWithTooltipFunction.tooltip = ( value: number ) => value + "$";

        tooltipView.setOptions(
            defaultsWithTooltipFunction.value,
            defaultsWithTooltipFunction.orientation,
            defaultsWithTooltipFunction.tooltip
        );

        view.setOptions(defaultsWithTooltip);

        view.render(document.body);
        view.renderPlugin("tooltip", tooltipView);

        const tooltip = document.querySelector(".jquery-slider-tooltip");

        expect(tooltip.innerHTML).toBe('0$');

        const defaultsWithAnotherValue = SliderModel.getDefaultOptions("horizontal");
        defaultsWithAnotherValue.value = 70;

        tooltipView.setOptions(defaultsWithAnotherValue.value,
            defaultsWithTooltipFunction.orientation,
            defaultsWithTooltipFunction.tooltip
        );

        view.setOptions(defaultsWithAnotherValue);

        expect(tooltip.innerHTML).toBe("70$");
    });
});