import Model from '../../src/plugin/Model/Model';

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
