import getCoords, { Coords } from '../../utils/getCoords';
import getShift, { Shift } from '../../utils/getShift';
import { Options } from '../Model/modelOptions';
import Observer from '../Observer/Observer';
import TooltipView from './TooltipView';

type HandleNumber = 'first' | 'second';
type HandleData = {
  handleNumber: HandleNumber;
  handleCoordinate: Coords;
}

class HandleView {
  private handle: HTMLDivElement;

  private position: HandleNumber;

  private tooltip: TooltipView | null;

  private mouseDownSubject = new Observer();

  private handleMovedSubject = new Observer();

  constructor(number: HandleNumber) {
    this.position = number;

    this.createHandle();
    this.setListeners();
  }

  whenMouseDown(
    callback: ({ handleNumber, cursorShift }: {
      handleNumber: HandleNumber;
      cursorShift: Shift;
    }) => void,
  ): void {
    this.mouseDownSubject.addObserver((cursorShift: Shift) => {
      const { handleNumber } = this;
      callback({ handleNumber, cursorShift });
    });
  }

  whenHandleMoved(callback: (handleData: HandleData) => void): void {
    this.handleMovedSubject.addObserver((handleData: HandleData) => {
      callback(handleData);
    });
  }

  get html(): HTMLDivElement {
    return this.handle;
  }

  get handleNumber(): HandleNumber {
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

  allowMovingWithinSpace({ availableSpace, orientation, cursorShift }: {
    availableSpace: Coords;
    orientation: Options['orientation'];
    cursorShift: Shift;
  }): void {
    const mouseMoveHandle = this.makeMouseMoveHandler({
      availableSpace, orientation, cursorShift,
    });
    document.addEventListener('mousemove', mouseMoveHandle);

    const mouseUpHandler = (): void => {
      document.removeEventListener('mousemove', mouseMoveHandle);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    document.addEventListener('mouseup', mouseUpHandler);
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

  private createHandle(): void {
    const handle = document.createElement('div');
    handle.setAttribute('class', 'jquery-slider__handle');
    handle.ondragstart = (): false => false;

    this.handle = handle;
  }

  private setListeners(): void {
    const notifyObservers = (mouseDownEvent: MouseEvent): false => {
      const cursorShift = this.getCursorShift(mouseDownEvent);
      this.mouseDownSubject.notifyObservers(cursorShift);

      return false;
    };

    this.handle.addEventListener('mousedown', notifyObservers);
  }

  private makeMouseMoveHandler({ availableSpace, orientation, cursorShift }: {
    availableSpace: Coords;
    orientation: Options['orientation'];
    cursorShift: Shift;
  }): (mouseMoveEvent: MouseEvent) => void {
    return (mouseMoveEvent: MouseEvent): void => {
      const isHorizontal = orientation === 'horizontal';
      const { pageX: eventX, pageY: eventY } = mouseMoveEvent;
      const { x: shiftX, y: shiftY } = cursorShift;

      const newPosition = isHorizontal
        ? eventX - shiftX - availableSpace.left
        : eventY - shiftY - availableSpace.top;

      const { width: handleWidth, height: handleHeight } = this.getCoords();

      const firstEdge = isHorizontal
        ? 0 - handleWidth / 2
        : 0 - handleHeight / 2;

      const secondEdge = isHorizontal
        ? availableSpace.width - handleWidth / 2
        : availableSpace.height - handleHeight / 2;

      const maybeSecondEdge = newPosition > secondEdge ? secondEdge : newPosition;
      const correctPosition = newPosition < firstEdge ? firstEdge : maybeSecondEdge;

      const handleCoordinate = isHorizontal
        ? availableSpace.left + correctPosition + handleWidth / 2
        : availableSpace.top + correctPosition + handleHeight / 2;

      const { handleNumber } = this;
      this.handleMovedSubject.notifyObservers({ handleNumber, handleCoordinate });
    };
  }
}

export default HandleView;
export {
  HandleNumber,
};
