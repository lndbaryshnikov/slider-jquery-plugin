import RangeView from '../../../src/plugin/View/RangeView';

describe('RangeView tests', () => {
  let root: HTMLDivElement;
  let range: RangeView;
  let domRange: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
    range = new RangeView();
    range.stickTo(root);

    domRange = document.querySelector('.jquery-slider__range');
  });

  afterEach(() => {
    root.remove();
  });

  test('range rendered correctly', () => {
    expect(!!domRange).toBeTruthy();
    expect(root.contains(domRange)).toBeTruthy();
  });

  test('setPosition works with horizontal slider', () => {
    range.setPosition({
      orientation: 'horizontal',
      firstPoint: 0,
      secondPoint: 100,
    });

    expect(domRange.style.left).toBe('0px');
    expect(domRange.style.width).toBe('100px');
  });

  test('setPosition works with vertical slider', () => {
    range.setPosition({
      orientation: 'vertical',
      firstPoint: 0,
      secondPoint: 100,
    });

    expect(domRange.style.bottom).toBe('0px');
    expect(domRange.style.height).toBe('100px');
  });

  test('rest methods work', () => {
    range.setTransition(100);
    expect(domRange.style.transition).toBe('100ms');

    range.setModifiers({
      orientation: 'horizontal',
      color: 'white',
    });

    const mainClass = 'jquery-slider__range';
    expect(domRange.className).toBe(
      `${mainClass} ${mainClass}_orientation_horizontal ${mainClass}_color_white`,
    );
  });
});
