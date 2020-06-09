import ErrorHandler, { ErrorObject } from '../../../src/plugin/ErrorHandler/ErrorHandler';
import { UserOptions, Options, ValueFunction } from '../../../src/plugin/Model/modelOptions';
import Model from '../../../src/plugin/Model/Model';

describe('setOptionsMethod exceptions', () => {
  let model: Model;

  const errors = ErrorHandler.getOptionErrors();

  beforeEach(() => {
    model = new Model();

    model.whenOptionsIncorrect((errorObject: ErrorObject) => {
      const handler = (message: string): void => {
        throw new Error(message);
      };

      new ErrorHandler(handler).throw(errorObject);
    });
  });

  test('throws error when userOptions is not an object', () => {
    expect(() => {
      model.setOptions('options' as UserOptions);
    }).toThrow(errors.common.notAnObject);
  });

  test('throws error when userOptions object does not correspond the required format', () => {
    expect(() => {
      model.setOptions({ minimal: 100, sweetness: 35 } as UserOptions);
    }).toThrow(errors.common.incorrectNames);
  });

  test('throws an exception when orientation is incorrect', () => {
    expect(() => {
      model.setOptions({ orientation: 'horzontal ' as 'horizontal' });
    }).toThrow(errors.orientation.incorrect);

    expect(() => {
      model.setOptions({ orientation: 'high ' as 'vertical' });
    }).toThrow(errors.orientation.incorrect);
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
    }).toThrow(errors.common.alreadySet);
  });

  test('throws extension when type of min, max, step or value is not a number', () => {
    const errorExpression = errors.common.incorrectOptionType;
    const checkType = (option: string): void => {
      expect(() => {
        model.setOptions({ [option]: 'false' as unknown as number });
      }).toThrow(errorExpression(option, 'number'));
    };

    checkType('min');
    checkType('max');
    checkType('step');
  });

  test('throws exception when type of value is not number or array', () => {
    const error = errors.value.incorrectType;

    expect(() => {
      model.setOptions(({ value: '20' } as unknown) as UserOptions);
    }).toThrow(error);
  });

  test('throws exception when range is true but value is not an array', () => {
    expect(() => {
      model.setOptions({ range: true });
    }).toThrow(errors.value.notCompatibleWithRange);
  });

  test('throws exception when range is not true but value is array', () => {
    expect(() => {
      model.setOptions({ value: [1, 99] });
    }).toThrow(errors.value.notCompatibleWithRange);
  });

  test('throws exception when value, as single option passes, goes beyond min and max', () => {
    expect(() => {
      model.setOptions({ min: 30, max: 120, value: 40 });
      model.setOptions({ value: 20 });
    }).toThrow(errors.value.beyondBorders);

    expect(() => {
      model.setOptions({
        min: 30,
        max: 120,
        value: [40, 60],
        range: true,
      });
      model.setOptions({ value: [20, 60] });
    }).toThrow(errors.value.beyondBorders);
  });

  test('throws exception when first value more than second', () => {
    expect(() => {
      model.setOptions({ range: true, value: [30, 20] });
    }).toThrow(errors.value.firstMoreThanSecond);
  });

  test('throws exception when value, min or max are incorrect', () => {
    const error = errors.value.beyondBorders;

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
        range: true,
        value: [50, 60],
        min: 10,
        max: 45,
      });
    }).toThrow(error);

    expect(() => {
      model.setOptions({ value: 50, max: 100, min: 60 });
    }).toThrow(error);

    expect(() => {
      model.setOptions({
        range: true,
        value: [40, 50],
        max: 100,
        min: 60,
      });
    }).toThrow(error);
  });

  test('throws exception when value is not a multiple of step', () => {
    const error = errors.value.notMultipleOfStep;

    expect(() => {
      model.setOptions({
        max: 10,
        step: 2,
        value: 1,
      });
    }).toThrow(error);

    expect(() => {
      model.setOptions({ max: 15, step: 5 });
      model.setOptions({ range: true, value: [1, 5] });
    }).toThrow(error);

    expect(() => {
      model.setOptions({ max: 15, step: 5 });
      model.setOptions({ range: true, value: [1, 3] });
    }).toThrow(error);
  });

  test('throws exception when step is not between min and max', () => {
    const error = errors.step.incorrect;

    expect(() => {
      model.setOptions({ step: -1 });
    }).toThrow(error);

    expect(() => {
      model.setOptions({ step: 101 });
    }).toThrow(error);
  });

  test('throws exception when step is not a multiple of min and max difference', () => {
    const error = errors.step.notAMultiple;

    expect(() => {
      model.setOptions({ step: 26 });
    }).toThrow(error);

    expect(() => {
      model.setOptions({ min: 3, max: 10, value: 3 });
      model.setOptions({ step: 3 });
    }).toThrow(error);
  });

  test('throws exceptions when option tooltip is not true, false or function', () => {
    expect(() => {
      model.setOptions(({ tooltip: 'true' } as unknown) as UserOptions);
    }).toThrow(errors.tooltip.incorrect);
  });

  test('throws exceptions when tooltip function is incorrect', () => {
    expect(() => {
      model.setOptions({
        tooltip: ((() => { Math.round(34.5); }) as unknown) as ValueFunction,
      });
    }).toThrow(errors.tooltip.incorrectFunction);

    expect(() => {
      model.setOptions({
        tooltip: ((() => (): number => 34) as unknown) as ValueFunction,
      });
    }).toThrow(errors.tooltip.incorrectFunction);
  });

  test('throws exceptions when animate property is incorrect', () => {
    expect(() => {
      model.setOptions({
        animate: ('slowly' as unknown) as Options['animate'],
      });
    }).toThrow(errors.animate.incorrect);

    expect(() => {
      model.setOptions({ animate: (true as unknown) as Options['animate'] });
    }).toThrow(errors.animate.incorrect);
  });

  test('throws exceptions when labels or pips are incorrect', () => {
    expect(() => {
      model.setOptions({ pips: (34 as unknown) as true });
    }).toThrow(errors.pips.incorrect);

    expect(() => {
      model.setOptions({
        pips: true,
        labels: ('false' as unknown) as Options['labels'],
      });
    }).toThrow(errors.labels.incorrect);

    expect(() => {
      model.setOptions({
        pips: true,
        labels: (((value: number) => { Math.round(value); }) as unknown) as Options['labels'],
      });
    }).toThrow(errors.labels.incorrectFunction);
  });

  test('throws exception when change is not function or false', () => {
    expect(() => {
      model.setOptions({ change: true as unknown as false });
    }).toThrow(errors.change.incorrect);

    const handler = (value: number): number => value;

    expect(() => {
      model.setOptions({ change: handler });
    }).toThrow(errors.change.incorrectFunction);
  });
});
