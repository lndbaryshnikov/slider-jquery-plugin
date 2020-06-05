import SliderModel, { Options } from '../../src/plugin/Model/SliderModel';
import OptionsErrorHandler from '../../src/plugin/Model/OptionsErrorHandler';

describe('getOptions method', () => {
  let model: SliderModel;
  const errors = OptionsErrorHandler.optionsErrors;

  beforeEach(() => {
    model = new SliderModel();

    model.whenOptionsAreIncorrect((error: string) => {
      throw new Error(error);
    });
  });

  test('throws exception when options are not set', () => {
    expect(() => {
      model.getOptions();
    }).toThrow('Options are not set');
  });

  test('return options object when no arguments passed', () => {
    model.setOptions();

    expect(model.getOptions()).toEqual(
      SliderModel.getDefaultOptions('horizontal'),
    );
  });

  test('return single option when only option name is provided', () => {
    model.setOptions();

    expect(model.getOptions('max')).toBe(
      SliderModel.getDefaultOptions('horizontal').max,
    );
    expect(model.getOptions('classes')).toEqual(
      SliderModel.getDefaultOptions('horizontal').classes,
    );
  });

  test('throws exception when incorrect options name provided', () => {
    model.setOptions();

    expect(() => {
      model.getOptions('minimal' as keyof Options);
    }).toThrow(errors.notExistingOption('minimal'));
  });

  test('return desires class', () => {
    model.setOptions({
      classes: {
        'jquery-slider-range': 'my-range',
        'jquery-slider-handle': 'my-firstHandle',
      },
    });

    expect(
      model.getOptions('classes', 'jquery-slider' as keyof Options['classes']),
    ).toBe('');
    expect(
      model.getOptions(
        'classes',
        'jquery-slider-range' as keyof Options['classes'],
      ),
    ).toBe('my-range');
  });

  test('throws exception when class name is incorrect', () => {
    model.setOptions();

    expect(() => {
      model.getOptions(
        'classes',
        'jquery-slider jquery-slider-horizontal' as keyof Options['classes'],
      );
    }).toThrow(
      errors.classes.notExistingClass('jquery-slider jquery-slider-horizontal'),
    );

    expect(() => {
      model.getOptions(
        'classes',
        'jquery-slider-my-range' as keyof Options['classes'],
      );
    }).toThrow(errors.classes.notExistingClass('jquery-slider-my-range'));
  });

  test(
    "throws exception when 2 arguments provided: option and class, but option is not 'classes'",
    () => {
      model.setOptions();

      expect(() => {
        model.getOptions('min', 'jquery-slider-handle');
      }).toThrow(errors.classes.contains);
    },
  );

  test('throws exception when options are not set', () => {
    expect(() => {
      model.getOptions();
    }).toThrow(errors.notSet);
  });
});
