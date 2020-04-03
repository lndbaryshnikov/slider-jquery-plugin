import getClassList from '../../src/common/getClassList';
import SliderModel, {
  HorizontalClasses,
} from '../../src/plugin/Slider/SliderModel';
import SliderPresenter from '../../src/plugin/Slider/SliderPresenter';
import SliderView from '../../src/plugin/Slider/SliderView';

const defaultClasses = SliderModel.getDefaultOptions('horizontal')
  .classes as HorizontalClasses;

describe('setModel method for setting classes', () => {
  let slider: SliderPresenter;

  beforeEach(() => {
    slider = new SliderPresenter(new SliderView(), new SliderModel());
  });

  afterEach(() => {
    slider.destroy();
  });

  test('set classes when main passes no classes in _model', () => {
    slider.initialize(document.body);

    expect(getClassList($('div'))).toEqual(defaultClasses);
  });

  test("set classes when main adds extra class 'my-slider' to 'jquery-slider' class", () => {
    slider.initialize(document.body, {
      classes: {
        'jquery-slider': 'my-slider',
      },
    });

    const domClasses = getClassList($('div'));

    const testClasses = $.extend(true, {}, defaultClasses);

    testClasses['jquery-slider jquery-slider-horizontal'] = 'my-slider';

    // eslint-disable-next-line fsd/jq-use-js-prefix-in-selector
    expect($('.jquery-slider').hasClass('my-slider')).toBe(true);
    expect(domClasses).toEqual(testClasses);
  });
});
