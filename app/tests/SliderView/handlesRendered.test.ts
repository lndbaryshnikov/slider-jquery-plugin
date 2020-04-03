import SliderView from '../../src/plugin/Slider/SliderView';
import SliderModel from '../../src/plugin/Slider/SliderModel';

describe("handles rendered depending on 'range'", () => {
  let view: SliderView;
  let root: HTMLDivElement;

  const getDefaultsWithRange = (range: boolean | 'min' | 'max') => {
    const defaults = SliderModel.getDefaultOptions('horizontal');
    defaults.range = range;

    return defaults;
  };

  const defaultsRangeMin = getDefaultsWithRange('min');
  const defaultsRangeTrue = getDefaultsWithRange(true);
  const defaultsRangeFalse = getDefaultsWithRange(false);

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);

    view = new SliderView();
  });

  afterEach(() => {
    root.remove();
  });

  test("one firstHandle rendered if 'range' is false and 'min'", () => {
    view.setOptions(defaultsRangeFalse);

    view.render(root);

    expect(document.querySelectorAll('.jquery-slider-handle').length).toBe(1);

    view.setOptions(defaultsRangeMin);

    expect(document.querySelectorAll('.jquery-slider-handle').length).toBe(1);
  });

  test("two handles rendered when 'range' is true", () => {
    view.setOptions(defaultsRangeTrue);

    view.render(root);

    expect(document.querySelectorAll('.jquery-slider-handle').length).toBe(2);
  });
});
