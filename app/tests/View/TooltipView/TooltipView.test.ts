import MainView from '../../../src/plugin/View/MainView';
import Model from '../../../src/plugin/Model/Model';
import TooltipView from '../../../src/plugin/View/TooltipView';
import { Options } from '../../../src/plugin/Model/modelOptions';

describe('TooltipView tests', () => {
  let view: MainView;
  let root: HTMLDivElement;
  let tooltip: TooltipView;
  const userOptions = {
    value: 35,
    orientation: 'horizontal' as Options['orientation'],
  };
  const defaultsWithTooltip = { ...Model.defaultOptions, ...{ tooltip: true } };
  const horizontalClass = 'jquery-slider-tooltip jquery-slider-tooltip_orientation_horizontal ';
  const verticalClass = 'jquery-slider-tooltip jquery-slider-tooltip_orientation_vertical ';

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
    view = new MainView();
    tooltip = new TooltipView();
  });

  afterEach(() => {
    root.remove();
  });

  describe('render method', () => {
    test('tooltip rendered correctly', () => {
      view.setOptions(defaultsWithTooltip);
      view.render(root);

      const handle = document.querySelector('.jquery-slider__handle');
      let tooltipOnDon = document.querySelector('.jquery-slider-tooltip');

      expect(!!tooltipOnDon).toBeTruthy();
      expect(handle.contains(tooltipOnDon)).toBeTruthy();
      expect(tooltipOnDon.innerHTML).toBe('0');

      const defaultsWIthAnotherValue = { ...defaultsWithTooltip, ...{ value: 50 } };
      view.setOptions(defaultsWIthAnotherValue);
      tooltipOnDon = document.querySelector('.jquery-slider-tooltip');

      expect(tooltipOnDon.innerHTML).toBe('50');
    });

    test('tooltip rendered correctly with function for value', () => {
      const defaultsWithFunction = Model.defaultOptions;
      defaultsWithFunction.tooltip = (value: number): string => `${value}$`;

      view.setOptions(defaultsWithFunction);
      view.render(root);

      let tooltipOnDon = document.querySelector('.jquery-slider-tooltip');

      expect(tooltipOnDon.innerHTML).toBe('0$');

      const defaultsWithAnotherValue = { ...defaultsWithFunction, ...{ value: 70 } };
      view.setOptions(defaultsWithAnotherValue);
      tooltipOnDon = document.querySelector('.jquery-slider-tooltip');

      expect(tooltipOnDon.innerHTML).toBe('70$');
    });
  });

  test('cleanTextField, setValue, remove methods', () => {
    tooltip.setOptions(userOptions);
    tooltip.render(root);
    tooltip.cleanTextField();

    const tooltipOnDom = document.querySelector('.jquery-slider-tooltip');

    expect(tooltip.value).toBe(null);
    expect(tooltipOnDom.innerHTML).toBe('');

    tooltip.setValue({ value: 12345 });

    expect(tooltipOnDom.innerHTML).toBe('12345');

    tooltip.remove();

    expect(root.contains(tooltip.html)).toBe(false);
  });

  test('setOrientation method', () => {
    tooltip.setOptions(userOptions);
    tooltip.render(root);

    const tooltipOnDom = document.querySelector('.jquery-slider-tooltip');

    expect(tooltipOnDom.className).toBe(horizontalClass);

    tooltip.setStyle({ orientation: 'vertical' });

    expect(tooltipOnDom.className).toBe(verticalClass);

    tooltip.setStyle({ orientation: 'horizontal' });

    expect(tooltipOnDom.className).toBe(horizontalClass);
  });

  test('getState method', () => {
    expect(tooltip.state).toEqual({
      isRendered: false,
      isSet: false,
    });

    tooltip.setOptions(userOptions);

    expect(tooltip.state).toEqual({
      isRendered: false,
      isSet: true,
    });

    tooltip.render(root);

    expect(tooltip.state).toEqual({
      isRendered: true,
      isSet: true,
    });

    tooltip.remove();

    expect(tooltip.state).toEqual({
      isRendered: false,
      isSet: true,
    });
  });

  test('setStyle method with custom styles', () => {
    tooltip.setOptions({ ...userOptions, ...{ style: 'orange' } });

    expect(tooltip.html.className).toBe(
      `${horizontalClass}jquery-slider-tooltip_color_orange`,
    );
  });
});
