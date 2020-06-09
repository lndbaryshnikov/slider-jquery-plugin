import Model from '../../../src/plugin/Model/Model';
import { UserOptions } from '../../../src/plugin/Model/modelOptions';

describe('When options object is passed', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model();
  });

  test('extending options', () => {
    const userOptions = { min: 20, max: 60, value: 30 };
    const testOptions = { ...Model.defaultOptions, ...userOptions };

    model.setOptions({ min: 20, max: 60, value: 30 });

    expect(model.getOptions()).toEqual(testOptions);
  });

  test('extending when options are already set', () => {
    const firstUserOptions = {
      value: 50,
      min: 30,
      range: 'min',
    } as UserOptions;

    const secondUserOptions = {
      max: 154,
      min: 13,
      range: 'max',
      orientation: 'vertical',
    } as UserOptions;

    model.setOptions(firstUserOptions);
    model.setOptions(secondUserOptions);

    const expectedOptions = {
      ...Model.defaultOptions,
      ...firstUserOptions,
      ...secondUserOptions,
    };

    expect(model.getOptions()).toEqual(expectedOptions);
  });
});
