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
        tooltipView.init(
            defaultsWithTooltip.value,
            defaultsWithTooltip.orientation,
        );

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

    test("tooltip rendered correctly with function for value", () => {
        const defaultsWithTooltipFunction = SliderModel.getDefaultOptions("horizontal");
        defaultsWithTooltipFunction.tooltip = ( value: number ) => value + "$";

        tooltipView.init(
            defaultsWithTooltipFunction.value,
            defaultsWithTooltipFunction.orientation,
            defaultsWithTooltipFunction.tooltip
        );

        view.setOptions(defaultsWithTooltip, tooltipView);

        view.render(document.body);

        const tooltip = document.querySelector(".jquery-slider-tooltip");

        expect(tooltip.innerHTML).toBe('0$');

        const defaultsWithAnotherValue = SliderModel.getDefaultOptions("horizontal");
        defaultsWithAnotherValue.value = 70;

        tooltipView.init(defaultsWithAnotherValue.value,
            defaultsWithTooltipFunction.orientation,
            defaultsWithTooltipFunction.tooltip
        );

        view.setOptions(defaultsWithAnotherValue, tooltipView);

        expect(tooltip.innerHTML).toBe("70$");
    });
});