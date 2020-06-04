import getCoords, { Coords } from '../../utils/getCoords';
import { Shift, getShift } from '../../utils/getShift';
import TooltipView from './TooltipView';

type HandleMouseEvent = 'click' | 'mousedown';
type HandleNumber = 'first' | 'second';

class HandleView {
  private handle: HTMLDivElement;

  private position: HandleNumber;

  private tooltip: TooltipView | null;

  constructor(number: HandleNumber) {
    this.position = number;
    this._createHandle();
  }

  get html(): HTMLDivElement {
    return this.handle;
  }

  get number(): HandleNumber {
    return this.position;
  }

  onClick(listener: (event: MouseEvent) => void): void {
    this.handle.addEventListener('click', listener);
  }

  onMousedown(listener: (event: MouseEvent) => false | void): void {
    this.handle.addEventListener('mousedown', listener);
  }

  stickTo(root: HTMLDivElement): void {
    root.append(this.handle);
  }

  setClass(...classes: string[]): void {
    this.handle.className = classes.join(' ');
  }

  setTransition(transitionValue: string): void {
    this.handle.style.transition = transitionValue;
  }

  getCoords(): Coords {
    return getCoords(this.handle);
  }

  isEventTarget(target: EventTarget): boolean {
    return target === this.handle;
  }

  moveTo({ moveFrom, value }: {
    moveFrom: 'left' | 'bottom';
    value: number;
  }): void {
    const { width: handleWidth, height: handleHeight } = this.getCoords();
    const sizeAdjustment = moveFrom === 'left' ? handleWidth / 2 : handleHeight / 2;

    this.handle.style[moveFrom] = `${value - sizeAdjustment}px`;
  }

  getCursorShift(event: MouseEvent): Shift {
    return getShift({ event, element: this.handle });
  }

  renderTooltip(tooltip: TooltipView): void {
    tooltip.render(this.handle);

    this.tooltip = tooltip;
  }

  doesContainTooltip() {
    const { tooltip, handle } = this;
    return tooltip && handle.contains(tooltip.html);
  }

  private _createHandle(): void {
    const handle = document.createElement('div');

    handle.style.position = 'absolute';
    handle.ondragstart = (): false => false;

    this.handle = handle;
  }
}

export default HandleView;
export {
  HandleMouseEvent,
};
