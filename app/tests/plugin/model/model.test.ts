import Model from '../../../src/plugin/Model/Model';
import ErrorHandler, { ErrorObject } from '../../../src/plugin/ErrorHandler/ErrorHandler';

describe('Model tests', () => {
  describe('getOptions method', () => {
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

    test('return options object when no arguments passed', () => {
      model.setOptions();

      expect(model.getOptions()).toEqual(
        Model.defaultOptions,
      );
    });

    test('throws exception when options are not set', () => {
      expect(() => {
        model.getOptions();
      }).toThrow(errors.common.notSet);
    });
  });

  describe('Model subscriptions', () => {
    let model: Model;

    beforeEach(() => {
      model = new Model();
      model.setOptions();
    });

    test('whenValueUpdated subscribers are getting notifications', () => {
      const subscriber = jest.fn();

      model.whenValueUpdated(subscriber);
      model.refreshValue(50);
      model.refreshValue(70);

      expect(subscriber).toHaveBeenCalledTimes(2);

      model.refreshValue(-1);

      expect(subscriber).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshValue method', () => {
    let model: Model;

    beforeEach(() => {
      model = new Model();
      model.setOptions();
    });

    test('value is not changing when it is incorrect', () => {
      model.setOptions({ value: 0 });
      model.refreshValue(-100);

      const { value } = model.getOptions();

      expect(value).toBe(0);
    });

    test('value is changing correctly', () => {
      model.setOptions({ value: 0 });
      model.refreshValue(50);

      const { value } = model.getOptions();

      expect(value).toBe(50);
    });
  });
});
