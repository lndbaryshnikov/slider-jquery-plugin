import SliderView from '../../src/components/Slider/SliderView';
import SliderModel from '../../src/components/Slider/SliderModel';

const defaults = SliderModel.getDefaultOptions('horizontal');

test('slider elements are set', () => {
  const sliderView = new SliderView();
  sliderView.setOptions(defaults);

  expect(typeof sliderView.html).toBe('object');

  expect(sliderView.html.wrapper.tagName).toBe('DIV');
  expect(sliderView.html.range.tagName).toBe('DIV');
  expect(sliderView.html.firstHandle.tagName).toBe('DIV');

  expect(sliderView.html.wrapper.contains(sliderView.html.range)).toBe(true);
  expect(sliderView.html.wrapper.contains(sliderView.html.firstHandle)).toBe(true);
});
