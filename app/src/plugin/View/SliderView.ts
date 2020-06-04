import getCoords, { Coords } from '../../utils/getCoords';
import Observer from '../Observer/Observer';
import TooltipView from './TooltipView';
import LabelsView from './LabelsView';
import { HorizontalClasses, Options, VerticalClasses } from '../Model/SliderModel';
import HandleView from './HandleView';
import RangeView from './RangeView';

interface SliderHtml {
  wrapper: HTMLDivElement | null;
  range: RangeView | null;
  firstHandle: HandleView | null;
  secondHandle?: HandleView | null;
}

class SliderView {
  private sliderHtml: SliderHtml | null = null;

  private root: HTMLElement | null = null;

  private options: Options | null = null;

  private classesHash: Options['classes'] | null = null;

  private handlesPositionInPixels: number[] | null = null;

  private state = {
    rendered: false,
  };

  private valueChangedSubject = new Observer();

  whenValueChanged(
    callback: (valueData: [number, 'first' | 'second']) => void,
  ): void {
    this.valueChangedSubject.addObserver(
      (valueData: [number, 'first' | 'second']) => {
        callback(valueData);
      },
    );
  }

  get html(): SliderHtml {
    return this.sliderHtml;
  }

  get value(): number | number[] {
    return this.options.value;
  }

  setOptions(options: Options): void {
    this.options = options;

    const wasRendered = this.state.rendered;

    let rootSnapshot: null | HTMLElement = null;

    if (wasRendered) {
      rootSnapshot = this.root;

      this.cleanDom();
    }

    this._setSliderElements();
    this._setHandleMovingHandler();
    this._setSliderClickHandler();

    this._setSliderClasses();
    this._setTransition();
    this._setHandlePositionInPixels();

    if (wasRendered) {
      this.render(rootSnapshot);
    }
  }

  render(root: HTMLElement): void {
    this.root = root;
    this.root.append(this.sliderHtml.wrapper);

    this.state.rendered = true;

    this._setHandlePositionInPixels();

    this._renderOptions();
  }

  destroy(): void {
    this.sliderHtml = undefined;
    this.root = undefined;
    this.options = undefined;
    this.handlesPositionInPixels = undefined;

    this.state.rendered = false;
  }

  cleanDom(): void {
    const isRendered = !!this.root || this.root.contains(this.sliderHtml.wrapper);

    if (isRendered) {
      this.sliderHtml.wrapper.remove();
    }

    this.state.rendered = false;
  }

  updateHandlePosition(value: Options['value']): void {
    this.options.value = value;

    this._setHandlePositionInPixels();
    this._renderHandlePositions();
    this._renderRange();
  }

  renderPlugin({ plugin, pluginView, number }: {
    plugin: 'tooltip' | 'labels';
    pluginView: TooltipView | LabelsView;
    number?: 'first' | 'second';
  }): void {
    if (plugin === 'labels') {
      pluginView.render(this.sliderHtml.wrapper);
    }

    if (plugin === 'tooltip') {
      const correctNumber = !number ? 'first' : number;

      const { firstHandle, secondHandle } = this.sliderHtml;

      const doesNotContainTooltip = (handle: HandleView): boolean => (
        handle && !handle.doesContainTooltip()
      );

      if (correctNumber === 'first') {
        if (doesNotContainTooltip(firstHandle)) {
          firstHandle.renderTooltip(pluginView as TooltipView);
        }
      }

      if (correctNumber === 'second') {
        if (doesNotContainTooltip(secondHandle)) {
          secondHandle.renderTooltip(pluginView as TooltipView);
        }
      }
    }
  }

  destroyPlugin({ plugin, instance }: {
    plugin: 'labels' | 'tooltip';
    instance: LabelsView | TooltipView;
  }): void {
    const isLabelOrTooltip = plugin === 'labels'
      || plugin === 'tooltip';

    if (isLabelOrTooltip) {
      instance.destroy();
    }
  }

  refreshValue({ currentHandleCoordinate, handleNumber }: {
    currentHandleCoordinate: number;
    handleNumber?: 'first' | 'second';
  }): void {
    const maybeFirstOrClosest = this.options.range !== true
      ? 'first'
      : this._getClosestHandleNumber(currentHandleCoordinate);
    const correctHandleNumber = handleNumber || maybeFirstOrClosest;

    const { orientation, max, min } = this.options;
    const difference = max - min;

    const sliderCoords = this._getCoords();

    const isHorizontal = orientation === 'horizontal';

    const firstBorder = isHorizontal ? sliderCoords.left : sliderCoords.top;
    const secondBorder = isHorizontal
      ? sliderCoords.right
      : sliderCoords.bottom;

    if (currentHandleCoordinate > secondBorder) {
      this.valueChangedSubject.notifyObservers([
        isHorizontal ? max : min,
        correctHandleNumber,
      ]);

      return;
    }

    if (currentHandleCoordinate < firstBorder) {
      this.valueChangedSubject.notifyObservers([
        isHorizontal ? min : max,
        correctHandleNumber,
      ]);

      return;
    }

    const currentHandlePosition = isHorizontal
      ? currentHandleCoordinate - sliderCoords.left
      : sliderCoords.height - (currentHandleCoordinate - sliderCoords.top);

    const getValuesArray = (): number[] => {
      const valuesArray: number[] = [];

      const { step } = this.options;

      for (let currentValue = min; currentValue <= max; currentValue += step) {
        valuesArray.push(currentValue);
      }

      return valuesArray;
    };

    const valuesArray = getValuesArray();

    const { width: sliderWidth, height: sliderHeight } = this._getCoords();

    const valueInPercents = isHorizontal
      ? currentHandlePosition / sliderWidth
      : currentHandlePosition / sliderHeight;

    const approximateValue = valueInPercents * difference + this.options.min;

    let value: number;

    for (let i = 0; i < valuesArray.length; i += 1) {
      const isValueBetweenTheseTwo = approximateValue >= valuesArray[i]
        && approximateValue <= valuesArray[i + 1];

      if (isValueBetweenTheseTwo) {
        const rangeFromFirst = approximateValue - valuesArray[i];
        const rangeFromSecond = valuesArray[i + 1] - approximateValue;

        value = rangeFromFirst < rangeFromSecond
          ? valuesArray[i]
          : valuesArray[i + 1];

        break;
      }
    }

    this.valueChangedSubject.notifyObservers([value, correctHandleNumber]);
  }

  private _renderOptions(): void {
    if (!this.state.rendered) return;

    this._renderHandlePositions();

    this._renderRange();
  }

  private _setHandleMovingHandler(): void {
    const mouseDownHandler = (mouseDownEvent: MouseEvent): false => {
      const handle = this._getTargetHandle(mouseDownEvent.target) as HandleView;
      const handleNumber = handle.number;
      const handleCoords = handle.getCoords();

      const { x: shiftX, y: shiftY } = handle.getCursorShift(mouseDownEvent);
      const availableSpace = this._countAvailableHandleSpace(handleNumber);

      const mouseMoveHandler = (mouseMoveEvent: MouseEvent): void => {
        const isHorizontal = this.options.orientation === 'horizontal';
        const newPosition = isHorizontal
          ? mouseMoveEvent.pageX - shiftX - availableSpace.left
          : mouseMoveEvent.pageY - shiftY - availableSpace.top;

        const firstEdge = isHorizontal
          ? 0 - handleCoords.width / 2
          : 0 - handleCoords.height / 2;

        const secondEdge = isHorizontal
          ? availableSpace.width - handleCoords.width / 2
          : availableSpace.height - handleCoords.height / 2;

        const maybeSecondEdge = newPosition > secondEdge ? secondEdge : newPosition;
        const correctPosition = newPosition < firstEdge ? firstEdge : maybeSecondEdge;

        const currentHandleCoordinate = isHorizontal
          ? availableSpace.left + correctPosition + handleCoords.width / 2
          : availableSpace.top + correctPosition + handleCoords.height / 2;

        this.refreshValue({
          currentHandleCoordinate,
          handleNumber,
        });
      };

      document.addEventListener('mousemove', mouseMoveHandler);

      const mouseUpHandler = (): void => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      };

      document.addEventListener('mouseup', mouseUpHandler);

      return false;
    };

    const { firstHandle, secondHandle } = this.sliderHtml;

    firstHandle.onMousedown(mouseDownHandler);

    if (this.options.range === true) {
      secondHandle.onMousedown(mouseDownHandler);
    }
  }

  private _setSliderClickHandler(): void {
    const sliderClickHandler = (clickEvent: MouseEvent): void => {
      const { firstHandle, secondHandle } = this.sliderHtml;
      const { target } = clickEvent;
      const areHandlesTargets = firstHandle.isEventTarget(target)
        || (secondHandle && secondHandle.isEventTarget(target));

      if (areHandlesTargets) return;

      const { pageX, pageY } = clickEvent;
      const { orientation, range } = this.options;

      const coordinateToMove = orientation === 'horizontal' ? pageX : pageY;
      const handleNumber = range === true
        ? this._getClosestHandleNumber(coordinateToMove)
        : 'first';

      this.refreshValue({
        currentHandleCoordinate: coordinateToMove,
        handleNumber,
      });
    };

    this.sliderHtml.wrapper.addEventListener(
      'click',
      sliderClickHandler,
    );
  }

  private _renderHandlePositions(): void {
    const { firstHandle, secondHandle } = this.sliderHtml;
    const [firstHandlePositionInPx, secondHandlePositionInPx] = this.handlesPositionInPixels;

    const moveFrom = this.options.orientation === 'horizontal' ? 'left' : 'bottom';

    firstHandle.moveTo({ moveFrom, value: firstHandlePositionInPx });

    if (this.options.range === true) {
      secondHandle.moveTo({ moveFrom, value: secondHandlePositionInPx });
    }
  }

  private _renderRange(): void {
    const { range } = this.options;

    if (range === false) return;

    const [firstHandlePosition, secondHandlePosition] = this.handlesPositionInPixels;
    const { width: sliderWidth, height: sliderHeight } = this._getCoords();
    const { orientation } = this.options;

    const sliderStart = 0;
    const sliderEnd = orientation === 'horizontal' ? sliderWidth : sliderHeight;

    const isRangeMin = range === 'min';
    const isRangeMax = range === 'max';

    const firstPoint = isRangeMin ? sliderStart : firstHandlePosition;
    const endMaybeFirstOrSecond = isRangeMin ? firstHandlePosition : secondHandlePosition;
    const secondPoint = isRangeMax ? sliderEnd : endMaybeFirstOrSecond;

    this.sliderHtml.range.setUp({ orientation, firstPoint, secondPoint });
  }

  private _setSliderClasses(): void {
    const { classes } = this.options;

    const defaultClasses = Object.keys(classes) as (keyof (
      | VerticalClasses
      | HorizontalClasses
    ))[];

    const [defaultWrapperClass, defaultRangeClass, defaultHandleClass] = defaultClasses;
    const { wrapper, range, firstHandle } = this.sliderHtml;

    wrapper.className = `${defaultWrapperClass} ${classes[defaultWrapperClass]}`;
    range.setClass(defaultRangeClass, classes[defaultRangeClass]);
    firstHandle.setClass(defaultHandleClass, classes[defaultHandleClass]);

    if (this.sliderHtml.secondHandle) {
      const { secondHandle } = this.sliderHtml;

      secondHandle.setClass(defaultHandleClass, classes[defaultHandleClass]);
    }
  }

  private _setTransition(): void {
    const { animate } = this.options;

    const maybeNull = typeof animate === 'number' ? animate : 0;
    const maybeSevenHundredOrNull = animate === 'slow' ? 700 : maybeNull;
    const transitionMs: number = animate === 'fast' ? 300 : maybeSevenHundredOrNull;

    const { firstHandle, range } = this.sliderHtml;

    range.setTransition(`${transitionMs}ms`);

    const makeChangeTransitionHandler = ({ handle, transition }: {
      handle: HandleView;
      transition: number;
    }): () => void => (
      (): void => {
        handle.setTransition(`${transition}ms`);
        range.setTransition(`${transition}ms`);
      }
    );

    const setTransition = (handle: HandleView): void => {
      handle.setTransition(`${transitionMs}ms`);

      handle.onMousedown(
        makeChangeTransitionHandler({
          handle,
          transition: 0,
        }),
      );

      document.addEventListener(
        'mouseup',
        makeChangeTransitionHandler({
          handle,
          transition: transitionMs,
        }),
      );
    };

    setTransition(firstHandle);

    if (this.options.range === true) {
      const { secondHandle } = this.sliderHtml;

      setTransition(secondHandle);
    }
  }

  private _setHandlePositionInPixels(): void {
    if (!this.state.rendered) return;

    this.handlesPositionInPixels = [];

    const {
      min, max, value, range, orientation,
    } = this.options;
    const difference = max - min;

    const firstValue = range === true
      ? (value as number[])[0]
      : (value as number);

    const firstValueInPercents = (firstValue - min) / difference;

    const { width: sliderWidth, height: sliderHeight } = this._getCoords();

    const addHandlePosition = (handleValueInPercents: number): void => {
      this.handlesPositionInPixels.push(
        orientation === 'horizontal'
          ? sliderWidth * handleValueInPercents
          : sliderHeight * handleValueInPercents,
      );
    };

    addHandlePosition(firstValueInPercents);

    if (range === true) {
      const [, secondValue] = value as number[];
      const secondValueInPercents = (secondValue - min) / difference;

      addHandlePosition(secondValueInPercents);
    }
  }

  private _countAvailableHandleSpace(
    targetHandleNumber: 'first' | 'second',
  ): Omit<Coords, 'centerX' | 'centerY'> {
    const { firstHandle, secondHandle } = this.sliderHtml;
    const isHorizontal = this.options.orientation === 'horizontal';

    let {
      right, left, top, bottom, width, height,
    }: Coords = this._getCoords();

    if (this.options.range === true) {
      const firstHandleCoords = firstHandle.getCoords();
      const secondHandleCoords = secondHandle.getCoords();

      if (targetHandleNumber === 'first') {
        if (isHorizontal) {
          right = secondHandleCoords.left - firstHandleCoords.width / 2;
        } else {
          top = secondHandleCoords.bottom + firstHandleCoords.height / 2;
        }
      } else if (isHorizontal) {
        left = firstHandleCoords.right + secondHandleCoords.width / 2;
      } else {
        bottom = firstHandleCoords.top - secondHandleCoords.height / 2;
      }

      width = right - left;
      height = bottom - top;
    }

    return {
      right, left, top, bottom, width, height,
    };
  }

  private _getTargetHandle(eventTarget: EventTarget): HandleView | false {
    const { firstHandle, secondHandle } = this.sliderHtml;
    const maybeSecond = secondHandle && secondHandle.isEventTarget(eventTarget)
      ? secondHandle : false;

    return firstHandle.isEventTarget(eventTarget) ? firstHandle : maybeSecond;
  }

  private _setSliderElements(): void {
    this.sliderHtml = {
      wrapper: document.createElement('div'),
      range: new RangeView(),
      firstHandle: new HandleView('first'),
    };

    this.sliderHtml.wrapper.style.position = 'relative';

    const { wrapper, firstHandle, range } = this.sliderHtml;

    range.stickTo(wrapper);
    firstHandle.stickTo(wrapper);

    if (this.options.range === true) {
      const secondHandle = new HandleView('second');
      secondHandle.stickTo(wrapper);

      this.sliderHtml.secondHandle = secondHandle;
    }
  }

  private _hasClassesChanged(): boolean {
    if (!this.classesHash) return true;

    const { classes } = this.options;
    const hash = this.classesHash;

    return Object.keys(this.options.classes).reduce(
      (result, mainClass): boolean => {
        if (
          Object.prototype.hasOwnProperty.call(this.options.classes, mainClass)
        ) {
          const isClassSameAsInHash = mainClass in hash
            && classes[mainClass] === hash[mainClass];

          if (!isClassSameAsInHash) {
            return true;
          }
        }

        return false;
      },
      false,
    );
  }

  private _getCoords(): Coords {
    return getCoords(this.sliderHtml.wrapper);
  }

  private _getClosestHandleNumber(coordinate: number): 'first' | 'second' {
    let handleNumber: 'first' | 'second';

    const { orientation, range } = this.options;
    const { firstHandle, secondHandle } = this.sliderHtml;

    if (range !== true) return undefined;

    const firstHandleCoords = firstHandle.getCoords();
    const secondHandleCoords = secondHandle.getCoords();

    if (orientation === 'horizontal') {
      const { right: firstRight } = firstHandleCoords;
      const { left: secondLeft } = secondHandleCoords;

      const isCoordinateBetweenHandles = coordinate < secondLeft
        && coordinate > firstRight;

      if (isCoordinateBetweenHandles) {
        const firstDistance = coordinate - firstRight;
        const secondDistance = secondLeft - coordinate;

        handleNumber = firstDistance > secondDistance ? 'second' : 'first';
      }

      if (coordinate < firstRight) handleNumber = 'first';
      if (coordinate > secondLeft) handleNumber = 'second';
    }

    if (this.options.orientation === 'vertical') {
      const { top: firstTop } = firstHandleCoords;
      const { bottom: secondBottom } = secondHandleCoords;

      const isCoordinateBetweenHandles = coordinate > secondBottom
        && coordinate < firstTop;

      if (isCoordinateBetweenHandles) {
        const firstDistance = firstTop - coordinate;
        const secondDistance = coordinate - secondBottom;

        handleNumber = firstDistance > secondDistance ? 'second' : 'first';
      }

      if (coordinate > firstTop) handleNumber = 'first';
      if (coordinate < secondBottom) handleNumber = 'second';
    }

    return handleNumber;
  }
}

export default SliderView;
