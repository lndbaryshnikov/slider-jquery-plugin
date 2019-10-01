import SliderTooltipView from "../../src/MVP modules/SliderTooltipView";

describe("tooltip works correctly", () => {
    let tooltip: SliderTooltipView;
    let root: HTMLDivElement;
    let tooltipOnDom: HTMLDivElement;

    beforeEach(() => {
        root = document.createElement("div");
        root.style.width = "5px";
        root.style.height = "5px";
        root.style.margin = "100px";

        tooltip = new SliderTooltipView();
        tooltip.init(35, "horizontal");
        tooltip.render(root);

        tooltipOnDom = document.querySelector(".jquery-slider-tooltip");
    });

    test("tooltip exists", () => {
        expect(root.contains(tooltip.html)).toBeTruthy();
    });

    test("tooltip's value is correct", () => {
        expect(tooltipOnDom.innerHTML).toBe("35");

        tooltip.setText("hey");

        expect(tooltipOnDom.innerHTML).toBe("hey");
    });

    test("rest methods", () => {
        tooltip.cleanTextField();

        expect(tooltip.text).toBe(null);
        expect(tooltipOnDom.innerHTML).toBe("");

        tooltip.remove();

        expect(root.contains(tooltip.html)).toBe(false);
    });

    test("destroy method works", () => {
        tooltip.destroy();

        expect(root.contains(tooltip.html)).toBe(false);
        expect(tooltip.text).toBe(null);
        expect(tooltip.html).toBe(null);
    });
});