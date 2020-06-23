import Model from '../../src/plugin/Model/Model';
import MainView from '../../src/plugin/View/MainView';

const defaults = Model.defaultOptions;

test('elements are set', () => {
  const view = new MainView();
  view.setOptions(defaults);

  const container = document.createElement('div');

  view.render(container);

  expect(typeof view.html).toBe('object');

  expect(view.html.slider.tagName).toBe('DIV');
  expect(view.html.range.html.tagName).toBe('DIV');
  expect(view.html.firstHandle.html.tagName).toBe('DIV');

  expect(view.html.slider.contains(view.html.range.html)).toBe(true);
  expect(view.html.slider.contains(view.html.firstHandle.html)).toBe(
    true,
  );
});
