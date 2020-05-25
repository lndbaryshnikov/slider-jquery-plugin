import SliderPresenter from '../../src/plugin/Presenter/SliderPresenter';
import SliderView from '../../src/plugin/View/SliderView';
import SliderModel from '../../src/plugin/Model/SliderModel';

test('view property should return an object', () => {
  const { view } = new SliderPresenter(new SliderView(), new SliderModel());
  expect(typeof view).toBe('object');
});
