import getCoords, { Coords } from '../../utils/getCoords';
import { Shift, getShift } from '../../utils/getShift';
import Observer from '../Observer/Observer';
import TooltipView from './TooltipView';

type HandleMouseEvent = 'click' | 'mousedown';
type HandleNumber = 'first' | 'second';

class HandleView {
  private handle: HTMLDivElement;

  private position: HandleNumber;

  private tooltip: TooltipView | null;

  private mouseDownSubject = new Observer();

  constructor(number: HandleNumber) {
    this.position = number;
    this._createHandle();
    this._setListeners();
  }

  whenMouseDown(
    callback: ({ handleNumber, halfOfHandle }: {
      handleNumber: HandleNumber;
      halfOfHandle: Record<'width' | 'height', number>;
      cursorShift: Shift;
    }) => void,
  ): void {
    this.mouseDownSubject.addObserver((cursorShift: Shift) => {
      const { width: handleWidth, height: handleHeight } = this.getCoords();

      const handleNumber = this.number;
      const halfOfHandle = {
        width: handleWidth / 2,
        height: handleHeight / 2,
      };

      callback({ handleNumber, halfOfHandle, cursorShift });
    });
  }

  get html(): HTMLDivElement {
    return this.handle;
  }

  get number(): HandleNumber {
    return this.position;
  }

  stickTo(root: HTMLElement): void {
    root.append(this.handle);
  }

  setModifiers({ orientation, color }: {
    orientation: string;
    color: string;
  }): void {
    const classes: string[] = [];

    if (orientation) classes.push(`jquery-slider__handle_orientation_${orientation}`);
    if (color) classes.push(`jquery-slider__handle_color_${color}`);

    this.handle.classList.add(...classes);
  }

  setTransition(transitionValue: number): void {
    this.handle.style.transition = `${transitionValue}ms`;
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

  doesContainTooltip(): boolean {
    const { tooltip, handle } = this;
    return tooltip && handle.contains(tooltip.html);
  }

  private _createHandle(): void {
    const handle = document.createElement('div');
    handle.setAttribute('class', 'jquery-slider__handle');
    handle.ondragstart = (): false => false;

    this.handle = handle;
  }

  private _setListeners(): void {
    const notify = (mouseDownEvent: MouseEvent): false => {
      const cursorShift = this.getCursorShift(mouseDownEvent);
      this.mouseDownSubject.notifyObservers(cursorShift);

      return false;
    };

    this.handle.addEventListener('mousedown', notify);
  }
}

export default HandleView;
export {
  HandleMouseEvent,
  HandleNumber,
};
