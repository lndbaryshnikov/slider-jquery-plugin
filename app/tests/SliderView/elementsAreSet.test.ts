import SliderView from '../../src/plugin/View/SliderView';
import SliderModel from '../../src/plugin/Model/SliderModel';

const defaults = SliderModel.getDefaultOptions('horizontal');

test('slider elements are set', () => {
  const sliderView = new SliderView();
  sliderView.setOptions(defaults);

  expect(typeof sliderView.html).toBe('object');

  expect(sliderView.html.wrapper.tagName).toBe('DIV');
  expect(sliderView.html.range.html.tagName).toBe('DIV');
  expect(sliderView.html.firstHandle.html.tagName).toBe('DIV');

  expect(sliderView.html.wrapper.contains(sliderView.html.range.html)).toBe(true);
  expect(sliderView.html.wrapper.contains(sliderView.html.firstHandle.html)).toBe(
    true,
  );
});
