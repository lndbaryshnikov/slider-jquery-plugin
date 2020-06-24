import TooltipView from '../../src/plugin/View/TooltipView';

describe('tooltip works correctly', () => {
  let tooltip: TooltipView;
  let root: HTMLDivElement;
  let horizontalTooltipOnDom: HTMLDivElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.style.width = '5px';
    root.style.height = '5px';
    root.style.margin = '100px';

    document.body.append(root);

    tooltip = new TooltipView();
    tooltip.setOptions({
      value: 35,
      orientation: 'horizontal',
    });
    tooltip.render(root);

    horizontalTooltipOnDom = document.querySelector('.jquery-slider-tooltip');
  });

  afterEach(() => {
    root.remove();
  });

  test('tooltip exists', () => {
    expect(root.contains(tooltip.html)).toBeTruthy();
  });

  test('tooltip\'s value is correct', () => {
    expect(horizontalTooltipOnDom.innerHTML).toBe('35');

    tooltip.setValue({ value: 23 });

    expect(horizontalTooltipOnDom.innerHTML).toBe('23');
  });

  test('rest methods', () => {
    tooltip.cleanTextField();

    expect(tooltip.value).toBe(null);
    expect(horizontalTooltipOnDom.innerHTML).toBe('');

    tooltip.setValue({ value: 12345 });

    expect(horizontalTooltipOnDom.innerHTML).toBe('12345');

    tooltip.remove();

    expect(root.contains(tooltip.html)).toBe(false);
  });

  test('setOrientation', () => {
    expect(horizontalTooltipOnDom.className).toBe(
      'jquery-slider-tooltip jquery-slider-tooltip_orientation_horizontal ',
    );

    tooltip.setStyle({ orientation: 'vertical' });
    expect(horizontalTooltipOnDom.className).toBe(
      'jquery-slider-tooltip jquery-slider-tooltip_orientation_vertical ',
    );

    tooltip.setStyle({ orientation: 'horizontal' });
    expect(horizontalTooltipOnDom.className).toBe(
      'jquery-slider-tooltip jquery-slider-tooltip_orientation_horizontal ',
    );
  });

  test('tooltip works with value function', () => {
    tooltip.remove();

    tooltip.setOptions({
      value: 70,
      orientation: 'horizontal',
      valueFunction: (value: number) => `${value}$`,
    });

    expect(tooltip.value).toBe('70$');
  });
});
