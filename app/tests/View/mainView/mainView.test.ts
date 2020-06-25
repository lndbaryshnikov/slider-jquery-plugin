import MainView from '../../../src/plugin/View/MainView';
import Model from '../../../src/plugin/Model/Model';
import { Options } from '../../../src/plugin/Model/modelOptions';

describe('MainView tests', () => {
  let view: MainView;
  let root: HTMLDivElement;
  const defaults = Model.defaultOptions;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);

    view = new MainView();
  });

  afterEach(() => {
    root.remove();
  });

  describe('Handles rendering', () => {
    const getDefaultsWithRange = (range: boolean | 'min' | 'max'): Options => {
      const options = { ...defaults };
      options.range = range;

      if (range === true) options.value = [0, 100];

      return options;
    };

    const defaultsRangeMin = getDefaultsWithRange('min');
    const defaultsRangeTrue = getDefaultsWithRange(true);
    const defaultsRangeFalse = getDefaultsWithRange(false);

    afterEach(() => {
      root.remove();
    });

    test('one firstHandle rendered if range is false and min', () => {
      view.setOptions(defaultsRangeFalse);
      view.render(root);

      expect(document.querySelectorAll('.jquery-slider__handle').length).toBe(1);

      view.setOptions(defaultsRangeMin);

      expect(document.querySelectorAll('.jquery-slider__handle').length).toBe(1);
    });

    test('two handles rendered when range is true', () => {
      view.setOptions(defaultsRangeTrue);
      view.render(root);

      expect(document.querySelectorAll('.jquery-slider__handle').length).toBe(2);
    });
  });

  test('render method - elements are rendered', () => {
    view.setOptions(defaults);
    view.render(root);

    expect(typeof view.html).toBe('object');

    expect(view.html.slider.tagName).toBe('DIV');
    expect(view.html.range.html.tagName).toBe('DIV');
    expect(view.html.firstHandle.html.tagName).toBe('DIV');

    expect(view.html.slider.contains(view.html.range.html)).toBe(true);
    expect(view.html.slider.contains(view.html.firstHandle.html)).toBe(
      true,
    );
  });

  test('destroy method works correctly', () => {
    view.setOptions(defaults);
    view.render(root);
    view.destroy();

    expect(document.querySelectorAll('div').length).toBe(0);
    expect(document.querySelector('.jquery-slider')).toBe(null);
    expect(document.querySelector('.jquery-slider-range')).toBe(null);
    expect(document.querySelector('.jquery-slider-handle')).toBe(null);
  });
});
