import TooltipView, { TooltipOptions } from '../../../src/plugin/components/View/TooltipView';
import { Options } from '../../../src/plugin/components/Model/modelOptions';

describe('TooltipView tests', () => {
  let root: HTMLDivElement;
  let tooltip: TooltipView;
  const options: TooltipOptions = {
    value: 35,
    orientation: 'horizontal' as Options['orientation'],
  };
  const horizontalClass = 'jquery-slider__tooltip jquery-slider__tooltip_orientation_horizontal ';
  const verticalClass = 'jquery-slider__tooltip jquery-slider__tooltip_orientation_vertical ';

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
    tooltip = new TooltipView();
  });

  afterEach(() => {
    root.remove();
  });

  describe('render method', () => {
    test('tooltip rendered correctly', () => {
      tooltip.setOptions(options);
      tooltip.render(root);

      let tooltipOnDon = document.querySelector('.jquery-slider__tooltip');

      expect(!!tooltipOnDon).toBeTruthy();
      expect(root.contains(tooltipOnDon)).toBeTruthy();
      expect(tooltipOnDon.innerHTML).toBe('35');

      const defaultsWIthAnotherValue = { ...options, value: 50 };
      tooltip.setOptions(defaultsWIthAnotherValue);
      tooltipOnDon = document.querySelector('.jquery-slider__tooltip');

      expect(tooltipOnDon.innerHTML).toBe('50');
    });

    test('tooltip rendered correctly with function for value', () => {
      const optionsWithFunction = { ...options };
      optionsWithFunction.valueFunction = (value: number): string => `${value}$`;

      tooltip.setOptions(optionsWithFunction);
      tooltip.render(root);

      let tooltipOnDon = document.querySelector('.jquery-slider__tooltip');

      expect(tooltipOnDon.innerHTML).toBe('35$');

      const defaultsWithAnotherValue = { ...optionsWithFunction, value: 70 };
      tooltip.setOptions(defaultsWithAnotherValue);
      tooltipOnDon = document.querySelector('.jquery-slider__tooltip');

      expect(tooltipOnDon.innerHTML).toBe('70$');
    });
  });

  test('cleanTextField, setValue, remove methods', () => {
    tooltip.setOptions(options);
    tooltip.render(root);
    tooltip.cleanTextField();

    const tooltipOnDom = document.querySelector('.jquery-slider__tooltip');

    expect(tooltip.value).toBe(null);
    expect(tooltipOnDom.innerHTML).toBe('');

    tooltip.setValue({ value: 12345 });

    expect(tooltipOnDom.innerHTML).toBe('12345');

    tooltip.remove();

    expect(root.contains(tooltip.html)).toBe(false);
  });

  test('setOrientation method', () => {
    tooltip.setOptions(options);
    tooltip.render(root);

    const tooltipOnDom = document.querySelector('.jquery-slider__tooltip');

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

    tooltip.setOptions(options);

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
    tooltip.setOptions({ ...options, style: 'orange' });

    expect(tooltip.html.className).toBe(
      `${horizontalClass}jquery-slider__tooltip_color_orange`,
    );
  });
});
