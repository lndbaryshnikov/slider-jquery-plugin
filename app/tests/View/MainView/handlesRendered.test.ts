import MainView from '../../../src/plugin/View/MainView';
import Model from '../../../src/plugin/Model/Model';
import { Options } from '../../../src/plugin/Model/modelOptions';

describe('handles rendered depending on range', () => {
  let view: MainView;
  let root: HTMLDivElement;

  const getDefaultsWithRange = (range: boolean | 'min' | 'max'): Options => {
    const defaults = Model.defaultOptions;
    defaults.range = range;

    if (range === true) defaults.value = [0, 100];

    return defaults;
  };

  const defaultsRangeMin = getDefaultsWithRange('min');
  const defaultsRangeTrue = getDefaultsWithRange(true);
  const defaultsRangeFalse = getDefaultsWithRange(false);

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);

    view = new MainView();
  });

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
