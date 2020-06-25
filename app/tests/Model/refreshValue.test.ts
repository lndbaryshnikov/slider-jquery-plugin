import Model from '../../src/plugin/Model/Model';

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
