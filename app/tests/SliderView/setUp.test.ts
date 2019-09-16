import SliderView from "../../src/MVP modules/Slider/SliderView";

test("SliderView initialization", () => {
    const sliderView = new SliderView();

    expect(typeof sliderView.html).toBe('object');

    expect(sliderView.html.wrapper.tagName).toBe('DIV');
    expect(sliderView.html.range.tagName).toBe('DIV');
    expect(sliderView.html.handle.tagName).toBe('DIV');

    expect(sliderView.html.wrapper.contains(sliderView.html.range)).toBe(true);
    expect(sliderView.html.wrapper.contains(sliderView.html.handle)).toBe(true);
});