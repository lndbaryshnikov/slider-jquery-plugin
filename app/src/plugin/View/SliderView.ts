import getCoords, { Coords } from '../../utils/getCoords';
import Observer from '../Observer/Observer';
import TooltipView from './TooltipView';
import LabelsView from './LabelsView';
import { HorizontalClasses, Options, VerticalClasses } from '../Model/SliderModel';
import HandleView from './HandleView';

interface Html {
  wrapper: HTMLDivElement | null;
  range: HTMLDivElement | null;
  firstHandle: HandleView;
  secondHandle?: HandleView | null;
}

class SliderView {
  private sliderHtml: Html | null = null;

  private root: HTMLElement | null = null;

  private options: Options | null = null;

  private classesHash: Options['classes'] | null = null;

  private handlesPositionInPixels: number[] | null = null;

  private data = {
    rendered: false,
  };

  private eventListeners = {
    handleMoving: {
      handleMouseDown: (mouseDownEvent: MouseEvent): false => {
        let freeSpaceCoords: Coords;
        const { target } = mouseDownEvent;

        const { orientation, range } = this.options;

        const { firstHandle, secondHandle } = this.sliderHtml;

        const isFirstHandleTarget = firstHandle.isEventTarget(target);
        const isSecondHandleTarget = secondHandle && secondHandle.isEventTarget(target);

        const targetHandle = isFirstHandleTarget ? firstHandle : secondHandle;
        const targetHandleCoords = targetHandle.getCoords();

        const isRangeTrue = range === true;

        if (!isRangeTrue && isFirstHandleTarget) {
          freeSpaceCoords = this._getCoords().wrapper;
        }

        if (isRangeTrue) {
          freeSpaceCoords = this._getCoords().wrapper;

          const firstHandleCoords = firstHandle.getCoords();
          const secondHandleCoords = secondHandle.getCoords();

          if (isFirstHandleTarget) {
            if (orientation === 'horizontal') {
              freeSpaceCoords.right = secondHandleCoords.left - firstHandleCoords.width / 2;

              freeSpaceCoords.width = freeSpaceCoords.right - freeSpaceCoords.left;
            }

            if (orientation === 'vertical') {
              freeSpaceCoords.top = secondHandleCoords.bottom + firstHandleCoords.height / 2;

              freeSpaceCoords.height = freeSpaceCoords.bottom - freeSpaceCoords.top;
            }
          }

          if (isSecondHandleTarget) {
            if (orientation === 'horizontal') {
              freeSpaceCoords.left = firstHandleCoords.right + secondHandleCoords.width / 2;

              freeSpaceCoords.width = freeSpaceCoords.right - freeSpaceCoords.left;
            }

            if (orientation === 'vertical') {
              freeSpaceCoords.bottom = firstHandleCoords.top - secondHandleCoords.height / 2;
              freeSpaceCoords.height = freeSpaceCoords.bottom - freeSpaceCoords.top;
            }
          }
        }

        let handleNumber: 'first' | 'second';

        if (isFirstHandleTarget) handleNumber = 'first';
        if (isSecondHandleTarget) handleNumber = 'second';

        const handleShift = targetHandle.getCursorShift(mouseDownEvent);

        const mouseMoveHandler = (mouseMoveEvent: MouseEvent): void => {
          if (this.options.orientation === 'horizontal') {
            const { x: shiftX } = handleShift;

            let newLeft = mouseMoveEvent.pageX - shiftX - freeSpaceCoords.left;
            const leftEdge = 0 - targetHandleCoords.width / 2;

            if (newLeft < leftEdge) newLeft = leftEdge;

            const rightEdge = freeSpaceCoords.width - targetHandleCoords.width / 2;

            if (newLeft > rightEdge) newLeft = rightEdge;

            const currentHandleXInPixels = freeSpaceCoords.left
              + newLeft
              + targetHandleCoords.width / 2;

            this.refreshValue({
              currentHandleCoordinate: currentHandleXInPixels,
              handleNumber,
            });
          }

          if (this.options.orientation === 'vertical') {
            const { y: shiftY } = handleShift;

            let newTop = mouseMoveEvent.pageY - shiftY - freeSpaceCoords.top;
            const topEdge = 0 - targetHandleCoords.height / 2;

            if (newTop < topEdge) newTop = topEdge;

            const bottomEdge = freeSpaceCoords.height - targetHandleCoords.height / 2;

            if (newTop > bottomEdge) newTop = bottomEdge;

            const currentHandleYInPixels = newTop
              + targetHandleCoords.height / 2
              + freeSpaceCoords.top;

            this.refreshValue({
              currentHandleCoordinate: currentHandleYInPixels,
              handleNumber,
            });
          }
        };

        document.addEventListener('mousemove', mouseMoveHandler);

        const mouseUpHandler = (): void => {
          document.removeEventListener('mousemove', mouseMoveHandler);
          document.removeEventListener('mouseup', mouseUpHandler);
        };

        document.addEventListener('mouseup', mouseUpHandler);

        return false;
      },
    },
    sliderClick: (clickEvent: MouseEvent): void => {
      const { firstHandle, secondHandle } = this.sliderHtml;
      const { target } = clickEvent;
      const areHandlesTargets = firstHandle.isEventTarget(target)
        || (secondHandle && secondHandle.isEventTarget(target));

      if (areHandlesTargets) return;

      let coordinateToMove: number;
      let handleNumber: 'first' | 'second' = 'first';

      if (this.options.orientation === 'horizontal') {
        coordinateToMove = clickEvent.pageX;
      }

      if (this.options.orientation === 'vertical') {
        coordinateToMove = clickEvent.pageY;
      }

      if (this.options.range === true) {
        handleNumber = this._getClosestHandleNumber(coordinateToMove);
      }

      this.refreshValue({
        currentHandleCoordinate: coordinateToMove,
        handleNumber,
      });
    },
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

  get html(): Html {
    return this.sliderHtml;
  }

  get value(): number | number[] {
    return this.options.value;
  }

  render(root: HTMLElement): void {
    this.root = root;
    this.root.append(this.sliderHtml.wrapper);

    this.data.rendered = true;

    this._setHandlePositionInPixels();

    this._renderOptions();
  }

  destroy(): void {
    this.sliderHtml = undefined;
    this.root = undefined;
    this.options = undefined;
    this.handlesPositionInPixels = undefined;

    this.data.rendered = false;
  }

  cleanDom(): void {
    const isRendered = !!this.root || this.root.contains(this.sliderHtml.wrapper);

    if (isRendered) {
      this.sliderHtml.wrapper.remove();
    }

    this.data.rendered = false;
  }

  setOptions(options: Options): void {
    this.options = options;

    const wasRendered = this.data.rendered;

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
      const doesFirstHandleContainTooltip = firstHandle.doesContainTooltip();

      if (correctNumber === 'first') {
        if (!doesFirstHandleContainTooltip) {
          firstHandle.renderTooltip(pluginView as TooltipView);
        }
      }

      if (correctNumber === 'second') {
        if (secondHandle && !doesFirstHandleContainTooltip) {
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
    let correctHandleNumber: string;

    if (!handleNumber) {
      if (this.options.range !== true) correctHandleNumber = 'first';
      else {
        correctHandleNumber = this._getClosestHandleNumber(
          currentHandleCoordinate,
        );
      }
    } else correctHandleNumber = handleNumber;

    const { orientation, max, min } = this.options;
    const difference = max - min;

    const wrapperCoords = this._getCoords().wrapper;

    const isHorizontal = orientation === 'horizontal';

    const wrapperStart = isHorizontal ? wrapperCoords.left : wrapperCoords.top;
    const wrapperEnd = isHorizontal
      ? wrapperCoords.right
      : wrapperCoords.bottom;

    if (currentHandleCoordinate > wrapperEnd) {
      this.valueChangedSubject.notifyObservers([
        isHorizontal ? this.options.max : this.options.min,
        correctHandleNumber,
      ]);

      return;
    }

    if (currentHandleCoordinate < wrapperStart) {
      this.valueChangedSubject.notifyObservers([
        isHorizontal ? this.options.min : this.options.max,
        correctHandleNumber,
      ]);

      return;
    }

    const currentHandlePosition = orientation === 'horizontal'
      ? currentHandleCoordinate - wrapperCoords.left
      : wrapperCoords.height - (currentHandleCoordinate - wrapperCoords.top);

    const getValuesArray = (): number[] => {
      const valuesArray: number[] = [];

      const { step } = this.options;

      for (let currentValue = min; currentValue <= max; currentValue += step) {
        valuesArray.push(currentValue);
      }

      return valuesArray;
    };

    const valuesArray = getValuesArray();

    const valueInPercents = this.options.orientation === 'horizontal'
      ? currentHandlePosition / this._getCoords().wrapper.width
      : currentHandlePosition / this._getCoords().wrapper.height;

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
    if (!this.data.rendered) return;

    this._renderHandlePositions();

    this._renderRange();
  }

  private _setHandleMovingHandler(): void {
    const { firstHandle, secondHandle } = this.sliderHtml;
    const { handleMouseDown: mouseDownHandler } = this.eventListeners.handleMoving;

    firstHandle.onMousedown(mouseDownHandler);

    if (this.options.range === true) {
      secondHandle.onMousedown(mouseDownHandler);
    }
  }

  private _setSliderClickHandler(): void {
    this.sliderHtml.wrapper.addEventListener(
      'click',
      this.eventListeners.sliderClick,
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
    const [firstHandlePosition, secondHandlePosition] = this.handlesPositionInPixels;
    const wrapperCoords = this._getCoords().wrapper;

    if (this.options.orientation === 'horizontal') {
      if (this.options.range === 'min') {
        this.sliderHtml.range.style.left = '0px';
        this.sliderHtml.range.style.width = `${firstHandlePosition}px`;
      }

      if (this.options.range === 'max') {
        this.sliderHtml.range.style.right = '0px';
        this.sliderHtml.range.style.width = `${
          wrapperCoords.width - firstHandlePosition
        }px`;
      }

      if (this.options.range === true) {
        this.sliderHtml.range.style.left = `${firstHandlePosition}px`;
        this.sliderHtml.range.style.right = `${secondHandlePosition}px`;
        this.sliderHtml.range.style.width = `${secondHandlePosition - firstHandlePosition}px`;
      }
    }
    if (this.options.orientation === 'vertical') {
      if (this.options.range === 'min') {
        this.sliderHtml.range.style.bottom = '0px';
        this.sliderHtml.range.style.height = `${firstHandlePosition}px`;
      }

      if (this.options.range === 'max') {
        this.sliderHtml.range.style.top = '0px';
        this.sliderHtml.range.style.height = `${
          wrapperCoords.height - firstHandlePosition
        }px`;
      }

      if (this.options.range === true) {
        this.sliderHtml.range.style.top = `${
          wrapperCoords.height - secondHandlePosition
        }px`;
        this.sliderHtml.range.style.bottom = `${firstHandlePosition}px`;
        this.sliderHtml.range.style.height = `${firstHandlePosition - secondHandlePosition}px`;
      }
    }
  }

  private _setSliderClasses(): void {
    const { classes } = this.options;

    const defaultClasses = Object.keys(classes) as (keyof (
      | VerticalClasses
      | HorizontalClasses
    ))[];

    const [defaultWrapperClass, defaultRangeClass, defaultHandleClass] = defaultClasses;
    const { wrapper, range, firstHandle } = this.sliderHtml;

    wrapper.style.position = 'relative';
    range.style.position = 'absolute';

    wrapper.className = `${defaultWrapperClass} ${classes[defaultWrapperClass]}`;
    range.className = `${defaultRangeClass} ${classes[defaultRangeClass]}`;
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

    range.style.transition = `${transitionMs}ms`;

    const makeChangeTransitionHandler = ({ handle, transition }: {
      handle: HandleView;
      transition: number;
    }): () => void => (
      (): void => {
        handle.setTransition(`${transition}ms`);
        range.style.transition = `${transition}ms`;
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
    if (!this.data.rendered) return;

    this.handlesPositionInPixels = [];

    const {
      min, max, value, range, orientation,
    } = this.options;
    const difference = max - min;

    const firstValue = range === true
      ? (value as number[])[0]
      : (value as number);

    const firstValueInPercents = (firstValue - min) / difference;

    const addHandlePosition = (handleValueInPercents: number): void => {
      this.handlesPositionInPixels.push(
        orientation === 'horizontal'
          ? this._getCoords().wrapper.width * handleValueInPercents
          : this._getCoords().wrapper.height * handleValueInPercents,
      );
    };

    addHandlePosition(firstValueInPercents);

    if (range === true) {
      const [, secondValue] = value as number[];
      const secondValueInPercents = (secondValue - min) / difference;

      addHandlePosition(secondValueInPercents);
    }
  }

  private _setSliderElements(): void {
    this.sliderHtml = {
      wrapper: document.createElement('div'),
      range: document.createElement('div'),
      firstHandle: new HandleView(),
    };

    const { wrapper, firstHandle } = this.sliderHtml;

    wrapper.append(this.sliderHtml.range);
    firstHandle.stickTo(wrapper);

    if (this.options.range === true) {
      const secondHandle = new HandleView();
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

  private _getCoords(): Record<'wrapper' | 'range', Coords> {
    return {
      wrapper: getCoords(this.sliderHtml.wrapper),
      range: getCoords(this.sliderHtml.range),
    };
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
