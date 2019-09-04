import SliderView from "../../src/MVP modules/Slider/_view";

test("should have html property", () => {
    const view = new SliderView();

    expect(!!view.html).toBe(true);
});