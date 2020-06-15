class RangeView {
  private range: HTMLDivElement;

  constructor() {
    this._createRange();
  }

  get html(): HTMLDivElement {
    return this.range;
  }

  stickTo(root: HTMLDivElement): void {
    root.append(this.range);
  }

  setClass(...classes: string[]): void {
    this.range.className = classes.join(' ');
  }

  setTransition(transitionValue: string): void {
    this.range.style.transition = transitionValue;
  }

  setUp({
    orientation, firstPoint, secondPoint,
  }: {
    orientation: 'horizontal' | 'vertical';
    firstPoint: number;
    secondPoint: number;
  }): void {
    const isHorizontal = orientation === 'horizontal';
    const firstEdgeProperty = isHorizontal ? 'left' : 'bottom';
    const differenceProperty = isHorizontal ? 'width' : 'height';

    this.range.style[firstEdgeProperty] = `${firstPoint}px`;
    this.range.style[differenceProperty] = `${secondPoint - firstPoint}px`;
  }

  _createRange(): void {
    const range = document.createElement('div');
    this.range = range;
  }
}

export default RangeView;
