import SliderView from '../../src/plugin/Slider/SliderView';
import SliderModel from '../../src/plugin/Slider/SliderModel';
import getClassList from '../../src/common/getClassList';

describe('destroy and cleanDom methods', () => {
  let sliderView: SliderView; let
    root: HTMLElement;

  const defaultOptions = SliderModel.getDefaultOptions('horizontal');

  beforeEach(() => {
    sliderView = new SliderView();

    sliderView.setOptions(defaultOptions);

    root = document.body;

    sliderView.render(root);
  });

  test('cleanDom method works correctly', () => {
    sliderView.cleanDom();

    expect(document.querySelectorAll('div').length).toBe(0);
    expect(document.querySelector('.jquery-slider')).toBe(null);
    expect(document.querySelector('.jquery-slider-range')).toBe(null);
    expect(document.querySelector('.jquery-slider-handle')).toBe(null);
  });

  test('destroy method works', () => {
    sliderView.destroy();

    expect(sliderView.html).toBe(undefined);
    expect(document.querySelectorAll('div').length).toBe(3);
    expect(getClassList($('div'))).toEqual(defaultOptions.classes);
  });
});
