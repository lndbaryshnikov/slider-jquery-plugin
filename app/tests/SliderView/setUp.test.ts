import SliderView from "../../src/MVP modules/Slider/SliderView";

test("setUp works", () => {
    const sliderView = new SliderView();

    expect(sliderView.html).toBe(undefined);

    sliderView.setUp();

    expect(sliderView.html.wrapper.tagName).toBe('DIV');
    expect(sliderView.html.range.tagName).toBe('DIV');
    expect(sliderView.html.handle.tagName).toBe('DIV');

    expect(sliderView.html.wrapper.contains(sliderView.html.range)).toBe(true);
    expect(sliderView.html.wrapper.contains(sliderView.html.handle)).toBe(true);
    expect(sliderView.html.range.contains(sliderView.html.handle)).toBe(true);
    // expect().
});