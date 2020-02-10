import SliderPresenter from '../../src/components/Slider/SliderPresenter';
import SliderView from '../../src/components/Slider/SliderView';
import SliderModel from '../../src/components/Slider/SliderModel';

test('view property should return an object', () => {
  const { view } = new SliderPresenter(new SliderView(), new SliderModel());
  expect(typeof view).toBe('object');
});
