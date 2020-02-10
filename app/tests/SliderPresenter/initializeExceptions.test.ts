import SliderPresenter from '../../src/components/Slider/SliderPresenter';
import SliderView from '../../src/components/Slider/SliderView';
import SliderModel from '../../src/components/Slider/SliderModel';

describe('initialize exceptions', () => {
  let slider: SliderPresenter;

  beforeEach(() => {
    slider = new SliderPresenter(new SliderView(), new SliderModel());
  });

  test('throws exceptions when render without setup', () => {
    expect(() => { slider.render(document.body); }).toThrow("Slider isn't setUp");
  });

  test('throws exception when setUp when slider already setUp', () => {
    slider.initialize(document.body);

    expect(() => { slider.initialize(document.body); }).toThrow('Slider is already initialized');
  });

  test('throws exception when destroy without initialize', () => {
    expect(() => { slider.destroy(); }).toThrow("Slider isn't initialized yet");
  });
});
