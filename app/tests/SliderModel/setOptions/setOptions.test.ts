import SliderModel, {
  Options,
  UserOptions,
} from '../../../src/plugin/Model/SliderModel';

describe('When options object is passed', () => {
  let model: SliderModel;

  beforeEach(() => {
    model = new SliderModel();
  });

  test('extends object when main changes classes', () => {
    model.setOptions({
      classes: {
        'jquery-slider-range': 'my-slider-range',
      },
    });

    const testOptions = $.extend(
      true,
      {},
      SliderModel.getDefaultOptions('horizontal'),
    );
    testOptions.classes['jquery-slider-range'] = 'my-slider-range';

    expect(model.getOptions()).toEqual(testOptions);
  });

  test('extends object with max = 60 and min = 20', () => {
    model.setOptions({ min: 20, max: 60, value: 30 });

    const testOptions = $.extend(
      true,
      {},
      SliderModel.getDefaultOptions('horizontal'),
    );

    testOptions.min = 20;
    testOptions.max = 60;
    testOptions.value = 30;

    expect(model.getOptions()).toEqual(testOptions);
  });

  test('options.classes and options.orientation depending on orientation', () => {
    const check = (
      modelToCheck: SliderModel,
      orientation: 'horizontal' | 'vertical' = 'horizontal',
    ): void => {
      modelToCheck.setOptions({ orientation });

      expect((modelToCheck.getOptions() as Options).orientation).toBe(
        orientation,
      );
      expect(
        `jquery-slider jquery-slider-${orientation}`
          in (modelToCheck.getOptions() as Options).classes,
      ).toBeTruthy();
      expect(modelToCheck.getOptions()).toEqual(
        SliderModel.getDefaultOptions(orientation),
      );
    };

    check(model);
    check(model, 'horizontal');
    check(model, 'vertical');
  });

  test('options.classes go in order', () => {
    model.setOptions({
      classes: {
        'jquery-slider-range': 'my-range',
        'jquery-slider': 'my-slider',
        'jquery-slider-handle': 'my-firstHandle',
      },
    });

    const { classes } = model.getOptions() as Options;
    const defaultClasses = SliderModel.getDefaultOptions('horizontal').classes;

    Object.keys(classes).forEach((mainClass: keyof typeof classes) => {
      classes[mainClass] = '';
    });

    expect(classes).toEqual(defaultClasses);

    const classesKeys = Object.keys(classes);
    const defaultClassesKeys = Object.keys(defaultClasses);

    for (let i = 0; i < classesKeys.length; i += 1) {
      expect(classesKeys[i]).toBe(defaultClassesKeys[i]);
    }
  });

  test('extension when options are already set', () => {
    model.setOptions({
      value: 50,
      min: 30,
      range: 'min',
    });

    expect((model.getOptions() as Options).min).toBe(30);
    expect((model.getOptions() as Options).value).toBe(50);
    expect((model.getOptions() as Options).range).toBe('min');
    expect((model.getOptions() as Options).classes).toEqual(
      SliderModel.getDefaultOptions('horizontal').classes,
    );

    model.setOptions({
      max: 154,
      min: 13,
      range: 'max',
      orientation: 'vertical',
    });

    expect((model.getOptions() as Options).min).toBe(13);
    expect((model.getOptions() as Options).max).toBe(154);
    expect((model.getOptions() as Options).range).toBe('max');
    expect((model.getOptions() as Options).orientation).toBe('vertical');
    expect((model.getOptions() as Options).classes).toEqual(
      SliderModel.getDefaultOptions('vertical').classes,
    );
  });

  test('extension when one option passed', () => {
    model.setOptions();
    model.setOptions('value', 34);

    const customDefaults = SliderModel.getDefaultOptions('horizontal');
    customDefaults.value = 34;

    expect(model.getOptions()).toEqual(customDefaults);
    expect((model.getOptions() as Options).value).toBe(34);

    model.setOptions('classes', {
      'jquery-slider': 'my-slider',
    } as UserOptions[keyof UserOptions]);

    expect(model.getOptions('classes')).toEqual({
      'jquery-slider jquery-slider-horizontal': 'my-slider',
      'jquery-slider-range': '',
      'jquery-slider-handle': '',
    });
  });

  test('classes extension by one-options extension', () => {
    model.setOptions();
    model.setOptions('classes', 'jquery-slider', 'my-slider');

    expect(model.getOptions('classes')).toEqual({
      'jquery-slider jquery-slider-horizontal': 'my-slider',
      'jquery-slider-range': '',
      'jquery-slider-handle': '',
    });

    expect(
      model.getOptions('classes', 'jquery-slider' as keyof Options['classes']),
    ).toBe('my-slider');

    model.setOptions('orientation', 'vertical');

    expect(model.getOptions('orientation')).toBe('vertical');

    expect(model.getOptions('classes')).toEqual({
      'jquery-slider jquery-slider-vertical': 'my-slider',
      'jquery-slider-range': '',
      'jquery-slider-handle': '',
    });

    model.setOptions('classes', {
      'jquery-slider': '',
      'jquery-slider-range': 'my-range',
      'jquery-slider-handle': '',
    });

    expect(model.getOptions('classes')).toEqual({
      'jquery-slider jquery-slider-vertical': '',
      'jquery-slider-range': 'my-range',
      'jquery-slider-handle': '',
    });

    model.setOptions('classes', 'jquery-slider-range', 'new-slider');

    expect(model.getOptions('classes')).toEqual({
      'jquery-slider jquery-slider-vertical': '',
      'jquery-slider-range': 'new-slider',
      'jquery-slider-handle': '',
    });

    model.setOptions('classes', 'jquery-slider', 'second-slider');

    expect(model.getOptions('classes')).toEqual({
      'jquery-slider jquery-slider-vertical': 'second-slider',
      'jquery-slider-range': 'new-slider',
      'jquery-slider-handle': '',
    });

    model.setOptions('classes', {
      'jquery-slider': '',
      'jquery-slider-range': '',
      'jquery-slider-handle': 'my-firstHandle',
    });

    expect(model.getOptions('classes')).toEqual({
      'jquery-slider jquery-slider-vertical': '',
      'jquery-slider-range': '',
      'jquery-slider-handle': 'my-firstHandle',
    });
  });
});
