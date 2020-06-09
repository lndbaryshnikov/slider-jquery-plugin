import MainView from '../../src/plugin/View/MainView';
import Model from '../../src/plugin/Model/Model';
import TooltipView from '../../src/plugin/View/TooltipView';

describe('tooltip exists on dom and contains value', () => {
  let view: MainView;
  const tooltipView = new TooltipView();
  const defaultsWithTooltip = Model.defaultOptions;
  defaultsWithTooltip.tooltip = true;

  beforeEach(() => {
    view = new MainView();
  });

  test('tooltip rendered correctly', () => {
    tooltipView.setOptions({
      text: defaultsWithTooltip.value as number,
      orientation: defaultsWithTooltip.orientation,
    });

    view.setOptions(defaultsWithTooltip);
    view.render(document.body);
    view.renderPlugin({
      plugin: 'tooltip',
      pluginView: tooltipView,
    });

    const handle = document.querySelector('.jquery-slider-handle');
    const tooltip = document.querySelector('.jquery-slider-tooltip');

    expect(!!tooltip).toBeTruthy();
    expect(handle.contains(tooltip)).toBeTruthy();
    expect(tooltip.innerHTML).toBe('0');

    const defaultsWIthAnotherValue = Model.defaultOptions;
    defaultsWIthAnotherValue.value = 50;

    tooltipView.setOptions({
      text: defaultsWIthAnotherValue.value,
      orientation: defaultsWithTooltip.orientation,
    });

    view.setOptions(defaultsWIthAnotherValue);

    expect(tooltip.innerHTML).toBe('50');
  });

  test('tooltip rendered correctly with function for value', () => {
    const defaultsWithTooltipFunction = Model.defaultOptions;
    defaultsWithTooltipFunction.tooltip = (value: number): string => `${value}$`;

    tooltipView.setOptions({
      text: defaultsWithTooltipFunction.value as number,
      orientation: defaultsWithTooltipFunction.orientation,
      func: defaultsWithTooltipFunction.tooltip,
    });

    view.setOptions(defaultsWithTooltip);

    view.render(document.body);
    view.renderPlugin({
      plugin: 'tooltip',
      pluginView: tooltipView,
    });

    const tooltip = document.querySelector('.jquery-slider-tooltip');

    expect(tooltip.innerHTML).toBe('0$');

    const defaultsWithAnotherValue = Model.defaultOptions;
    defaultsWithAnotherValue.value = 70;

    tooltipView.setOptions({
      text: defaultsWithAnotherValue.value,
      orientation: defaultsWithTooltipFunction.orientation,
      func: defaultsWithTooltipFunction.tooltip,
    });

    view.setOptions(defaultsWithAnotherValue);

    expect(tooltip.innerHTML).toBe('70$');
  });
});
