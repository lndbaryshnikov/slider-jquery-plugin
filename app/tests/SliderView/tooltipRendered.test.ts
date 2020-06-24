import MainView from '../../src/plugin/View/MainView';
import Model from '../../src/plugin/Model/Model';

describe('tooltip exists on dom and contains value', () => {
  let view: MainView;
  let root: HTMLDivElement;
  const defaultsWithTooltip = { ...Model.defaultOptions, ...{ tooltip: true } };

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
    view = new MainView();
  });

  afterEach(() => {
    root.remove();
  });

  test('tooltip rendered correctly', () => {
    view.setOptions(defaultsWithTooltip);
    view.render(root);

    const handle = document.querySelector('.jquery-slider__handle');
    let tooltip = document.querySelector('.jquery-slider-tooltip');

    expect(!!tooltip).toBeTruthy();
    expect(handle.contains(tooltip)).toBeTruthy();
    expect(tooltip.innerHTML).toBe('0');

    const defaultsWIthAnotherValue = { ...defaultsWithTooltip, ...{ value: 50 } };
    view.setOptions(defaultsWIthAnotherValue);
    tooltip = document.querySelector('.jquery-slider-tooltip');

    expect(tooltip.innerHTML).toBe('50');
  });

  test('tooltip rendered correctly with function for value', () => {
    const defaultsWithTooltipFunction = Model.defaultOptions;
    defaultsWithTooltipFunction.tooltip = (value: number): string => `${value}$`;

    view.setOptions(defaultsWithTooltipFunction);
    view.render(document.body);

    let tooltip = document.querySelector('.jquery-slider-tooltip');

    expect(tooltip.innerHTML).toBe('0$');

    const defaultsWithAnotherValue = { ...defaultsWithTooltipFunction, ...{ value: 70 } };
    view.setOptions(defaultsWithAnotherValue);
    tooltip = document.querySelector('.jquery-slider-tooltip');

    expect(tooltip.innerHTML).toBe('70$');
  });
});
