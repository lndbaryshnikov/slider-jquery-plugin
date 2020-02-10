import SliderModel, { Options, ValueFunction, UserOptions } from '../../../src/components/Slider/SliderModel';

describe('setOptionsMethod exceptions', () => {
  let model: SliderModel;

  const errors = SliderModel.optionsErrors;

  beforeEach(() => {
    model = new SliderModel();

    model.whenOptionsAreIncorrect((error: string) => {
      throw new Error(error);
    });
  });

  test("throws error when userOptions isn't an object", () => {
    expect(() => {
      model.setOptions('options' as UserOptions);
    }).toThrow(errors.incorrectOptions);
  });

  test("throws error when userOptions object doesn't correspond the required format", () => {
    expect(() => {
      model.setOptions({ minimal: 100, sweetness: 35 } as UserOptions);
    }).toThrow(errors.incorrectOptionsObject);
  });

  test('throws error when main passes wrong class _options', () => {
    expect(() => {
      model.setOptions({ classes: { 'jquery-sl': 'my-slider' } } as UserOptions);
    }).toThrow(errors.classes.incorrectType);
  });

  test("throws error when main adds whitespaces in slider's main classes", () => {
    expect(() => {
      model.setOptions({
        classes: {
          'jquery-slider  ': 'slider',
          '  jquery-slider-range  ': 'range',
        },
      } as UserOptions);
    }).toThrow(errors.classes.extraWs);
  });

  test('throws an exception when options.orientation is incorrect', () => {
    expect(() => {
      model.setOptions({ orientation: 'horizontal ' as 'horizontal' });
    }).toThrow(errors.orientation.incorrect);

    expect(() => {
      model.setOptions({ orientation: 'high ' as 'vertical' });
    }).toThrow(errors.orientation.incorrect);
  });

  test('extension of singe option when options are not set', () => {
    expect(() => {
      model.setOptions('max', 35);
    }).toThrow(errors.notSet);
  });

  test('throws an exceptions when custom class is not of string type', () => {
    expect(() => {
      model.setOptions({
        classes: {
          'jquery-slider-handle': 34 as unknown as string,
        },
      });
    }).toThrow(errors.options.incorrectType('classes', 'string'));
  });

  test('throws extension when range option is incorrect', () => {
    expect(() => {
      model.setOptions({ range: 'maximum' as Options['range'] });
    }).toThrow(errors.range.incorrect);
  });

  test('passing no options when options are already set', () => {
    expect(() => {
      model.setOptions();
      model.setOptions();
    }).toThrow(errors.alreadySet);
  });

  test('extension of single option when options does not exist', () => {
    expect(() => {
      model.setOptions();
      model.setOptions('maximum' as keyof Options, 36);
    }).toThrow(errors.options.notExisting('maximum'));
  });

  test('extension of single parameter (not classes) when 3 arguments provided', () => {
    expect(() => {
      model.setOptions();
      model.setOptions('max', 'top', 35);
    }).toThrow(errors.classes.twoExtra);
  });

  test('single class extension when provided main class does not exist', () => {
    expect(() => {
      model.setOptions();
      model.setOptions('classes', 'my-jq-slider', 'slider');
    }).toThrow(errors.classes.notExisting('my-jq-slider'));
  });

  test('extension of single class when custom class is not of string type', () => {
    expect(() => {
      model.setOptions();
      model.setOptions('classes', 'jquery-slider', 34);
    }).toThrow(errors.classes.customIsNotString);
  });

  test("throws extension when type of 'min', 'max', 'step' or 'value' is not 'number'", () => {
    const checkStringType = (type: 'min' | 'max' | 'step' | 'value') => {
      expect(() => {
        model.setOptions();
        model.setOptions(type, '34');
      }).toThrow(errors.options.incorrectType(type, 'number'));

      model.destroy();
    };

    checkStringType('min');
    checkStringType('max');
    checkStringType('step');
  });

  test("throws exception when type of 'value' is not number or array", () => {
    const error = errors.value.incorrectType;

    expect(() => {
      model.setOptions({ value: '20' } as unknown as UserOptions);
    }).toThrow(error);

    expect(() => {
      model.setOptions();
      model.setOptions('value', '20');
    }).toThrow(error);
  });

  test('throws exception when range is true but value is not an array', () => {
    expect(() => {
      model.setOptions({ range: true });
    }).toThrow(errors.value.rangeTrue);
  });

  test('throws exception when range is not true but value is array', () => {
    expect(() => {
      model.setOptions({ value: [1, 99] });
    }).toThrow(errors.value.rangeNotTrue);
  });

  test('throws exception when value, as single option passes, goes beyond min and max', () => {
    expect(() => {
      model.setOptions({ min: 30, max: 120, value: 40 });
      model.setOptions('value', 20);
    }).toThrow(errors.value.beyond);

    expect(() => {
      model.setOptions({
        min: 30, max: 120, value: [40, 60], range: true,
      });
      model.setOptions('value', [20, 60]);
    }).toThrow(errors.value.beyond);
  });

  test("throws exception when 'max', as single option passes, less that 'value'", () => {
    expect(() => {
      model.setOptions({ value: 40 });
      model.setOptions('max', 30);
    }).toThrow(errors.minAndMax.lessOrMore('max', 'less'));

    expect(() => {
      model.setOptions({ value: [20, 30], range: true });
      model.setOptions('max', 25);
    }).toThrow(errors.minAndMax.lessOrMore('max', 'less'));
  });

  test("throws exception when 'min', as single option passes, more than 'value'", () => {
    expect(() => {
      model.setOptions({ value: 50, max: 120 });
      model.setOptions('min', 60);
    }).toThrow(errors.minAndMax.lessOrMore('min', 'more'));

    expect(() => {
      model.setOptions({ value: [50, 60], range: true, max: 120 });
      model.setOptions('min', 55);
    }).toThrow(errors.minAndMax.lessOrMore('min', 'more'));
  });

  test("throws exception when 'value', 'min' or 'max' are incorrect", () => {
    const error = errors.value.beyond;

    expect(() => {
      model.setOptions({ value: 150 });
    }).toThrow(error);

    expect(() => {
      model.setOptions({ range: true, value: [100, 150] });
    }).toThrow(error);

    expect(() => {
      model.setOptions({ min: 10 });
    }).toThrow(error);

    expect(() => {
      model.setOptions({ value: 50, min: 10, max: 45 });
    }).toThrow(error);

    expect(() => {
      model.setOptions({
        range: true, value: [50, 60], min: 10, max: 45,
      });
    }).toThrow(error);

    expect(() => {
      model.setOptions({ value: 50, max: 100, min: 60 });
    }).toThrow(error);

    expect(() => {
      model.setOptions({
        range: true, value: [40, 50], max: 100, min: 60,
      });
    }).toThrow(error);
  });

  test("throws exception when 'step' is not between 'min' and 'max'", () => {
    const error = errors.step.incorrect;

    expect(() => {
      model.setOptions({
        step: 0,
      });
    }).toThrow(error);

    expect(() => {
      model.setOptions({
        step: 101,
      });
    }).toThrow(error);

    expect(() => {
      model.setOptions();
      model.setOptions('step', -1);
    }).toThrow(error);

    model.destroy();

    expect(() => {
      model.setOptions();
      model.setOptions('step', 103);
    }).toThrow(error);
  });

  test('throws exceptions when option tooltip is not true, false or function', () => {
    expect(() => {
      model.setOptions({ tooltip: 'true' } as unknown as UserOptions);
    }).toThrow(errors.tooltip.incorrect);

    model.setOptions();

    expect(() => {
      model.setOptions('tooltip', 34);
    }).toThrow(errors.tooltip.incorrect);
  });

  test('throws exceptions when tooltip function is incorrect', () => {
    expect(() => {
      model.setOptions({ tooltip: (() => { console.log(34); }) as unknown as ValueFunction });
    }).toThrow(errors.tooltip.incorrectFunction);

    expect(() => {
      model.setOptions({ tooltip: (() => () => 34) as unknown as ValueFunction });
    }).toThrow(errors.tooltip.incorrectFunction);

    model.setOptions();

    expect(() => {
      model.setOptions('tooltip', (() => { console.log(34); }) as ValueFunction);
    }).toThrow(errors.tooltip.incorrectFunction);

    expect(() => {
      model.setOptions('tooltip', (() => () => 34) as unknown as ValueFunction);
    }).toThrow(errors.tooltip.incorrectFunction);
  });

  test("throws exceptions when 'animate' property is incorrect", () => {
    expect(() => {
      model.setOptions({ animate: 'slowly' as unknown as Options['animate'] });
    }).toThrow(errors.animate.incorrect);

    expect(() => {
      model.setOptions({ animate: true as unknown as Options['animate'] });
    }).toThrow(errors.animate.incorrect);

    model.setOptions();

    expect(() => {
      model.setOptions('animate', 'slowly' as unknown as Options['animate']);
    }).toThrow(errors.animate.incorrect);

    expect(() => {
      model.setOptions('animate', true as unknown as Options['animate']);
    }).toThrow(errors.animate.incorrect);
  });

  test("throws exceptions when 'labels' or 'pips' are incorrect", () => {
    expect(() => {
      model.setOptions({ pips: 34 as unknown as true });
    }).toThrow(errors.pips.incorrect);

    expect(() => {
      model.setOptions({ pips: true, labels: 'false' as unknown as Options['labels'] });
    }).toThrow(errors.labels.incorrect);

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      model.setOptions({ pips: true, labels: ((value: number) => {}) as unknown as Options['labels'] });
    }).toThrow(errors.labels.incorrectFunction);

    model.setOptions();

    expect(() => {
      model.setOptions('pips', 'each' as unknown as Options['pips']);
    }).toThrow(errors.pips.incorrect);

    expect(() => {
      model.setOptions('labels', 'small' as unknown as Options['labels']);
    }).toThrow(errors.labels.incorrect);

    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      model.setOptions('labels', ((value: number) => true) as unknown as Options['labels']);
    }).toThrow(errors.labels.incorrectFunction);
  });

  test('throws exception when change is not function or false', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      model.setOptions({ change: true });
    }).toThrow(errors.change.incorrect);

    model.setOptions();

    expect(() => {
      model.setOptions('change', (value: number) => value);
    }).toThrow(errors.change.incorrectFunction);
  });
});
