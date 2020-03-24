import SliderPresenter from '../../src/plugin/Slider/SliderPresenter';
import SliderView from '../../src/plugin/Slider/SliderView';
import SliderModel from '../../src/plugin/Slider/SliderModel';

test('view property should return an object', () => {
  const { view } = new SliderPresenter(new SliderView(), new SliderModel());
  expect(typeof view).toBe('object');
});
