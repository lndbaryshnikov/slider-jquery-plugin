import MainView from '../../../src/plugin/View/MainView';
import Model from '../../../src/plugin/Model/Model';

describe('destroy method', () => {
  let view: MainView;
  let root: HTMLElement;

  const { defaultOptions } = Model;

  beforeEach(() => {
    view = new MainView();
    root = document.body;

    view.setOptions(defaultOptions);
    view.render(root);
  });

  test('destroy method works correctly', () => {
    view.destroy();

    expect(document.querySelectorAll('div').length).toBe(0);
    expect(document.querySelector('.jquery-slider')).toBe(null);
    expect(document.querySelector('.jquery-slider-range')).toBe(null);
    expect(document.querySelector('.jquery-slider-handle')).toBe(null);
  });
});
