import SliderTooltipView from "../../src/MVP modules/SliderTooltipView";

describe("tooltip works correctly", () => {
    let tooltip: SliderTooltipView;
    let root: HTMLDivElement;
    let horizontalTooltipOnDom: HTMLDivElement;

    beforeEach(() => {
        root = document.createElement("div");
        root.style.width = "5px";
        root.style.height = "5px";
        root.style.margin = "100px";

        document.body.append(root);

        tooltip = new SliderTooltipView();
        tooltip.init(35, "horizontal");
        tooltip.render(root);

        horizontalTooltipOnDom = document.querySelector(".jquery-slider-tooltip");
    });

    afterEach(() => {
       root.remove();
    });

    test("tooltip exists", () => {
        expect(root.contains(tooltip.html)).toBeTruthy();
    });

    test("tooltip's value is correct", () => {
        expect(horizontalTooltipOnDom.innerHTML).toBe("35");

        tooltip.setText("hey");

        expect(horizontalTooltipOnDom.innerHTML).toBe("hey");
    });

    test("rest methods", () => {
        tooltip.cleanTextField();

        expect(tooltip.text).toBe(null);
        expect(horizontalTooltipOnDom.innerHTML).toBe("");

        tooltip.setText(12345);

        expect(horizontalTooltipOnDom.innerHTML).toBe("12345");

        tooltip.remove();

        expect(root.contains(tooltip.html)).toBe(false);
    });

    test("destroy method works", () => {
        tooltip.destroy();

        expect(root.contains(tooltip.html)).toBe(false);
        expect(tooltip.text).toBe(null);
        expect(tooltip.html.className).toBe("jquery-slider-tooltip");
        expect(tooltip.html.innerHTML).toBe("");
    });
    
    test("setOrientation", () => {
        expect(horizontalTooltipOnDom.className).toBe("jquery-slider-tooltip jquery-slider-tooltip-horizontal");

        tooltip.setOrientation("vertical");
        expect(horizontalTooltipOnDom.className).toBe("jquery-slider-tooltip jquery-slider-tooltip-vertical");

        tooltip.setOrientation("horizontal");
        expect(horizontalTooltipOnDom.className).toBe("jquery-slider-tooltip jquery-slider-tooltip-horizontal");
    });

    test("tooltip works with value function", () => {
        tooltip.destroy();

        tooltip.init(70, "horizontal", (value: number) => value + "$" );

        expect(tooltip.text).toBe("70$");
    });
});