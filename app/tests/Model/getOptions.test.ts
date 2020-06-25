import ErrorHandler, { ErrorObject } from '../../src/plugin/ErrorHandler/ErrorHandler';
import Model from '../../src/plugin/Model/Model';

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
