import { getShift, Shift } from '../../common/getShift';
import getCoords, { Coords } from '../../common/getCoords';
import Observer from '../Observer/Observer';
import SliderTooltipView from '../SliderTooltipView/SliderTooltipView';
import SliderLabelsView from '../SliderLabelsView/SliderLabelsView';
import { HorizontalClasses, Options, VerticalClasses } from './SliderModel';

interface Html {
  wrapper: HTMLDivElement | null;
  range: HTMLDivElement | null;
  firstHandle: HTMLDivElement | null;
  secondHandle: HTMLDivElement | null;
}
export default class SliderView {
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
        const targetHandle = mouseDownEvent.target;

        const { orientation } = this.options;

        const isRangeTrue = this.options.range === true;
        const isFirstHandleTarget = targetHandle === this.sliderHtml.firstHandle;
        const isSecondHandleTarget = targetHandle === this.sliderHtml.secondHandle;

        if (!isRangeTrue && isFirstHandleTarget) {
          freeSpaceCoords = this._getCoords().wrapper;
        }

        if (isRangeTrue) {
          freeSpaceCoords = this._getCoords().wrapper;

          const {
            firstHandle: firstHandleCoords,
            secondHandle: secondHandleCoords,
          } = this._getCoords();

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

        const handleShift = this._countHandleShift({
          mouseDownEvent,
          handleNumber,
        });

        const mouseMoveHandler = (mouseMoveEvent: MouseEvent) => {
          if (this.options.orientation === 'horizontal') {
            const { x: shiftX } = handleShift;

            let newLeft = mouseMoveEvent.pageX - shiftX - freeSpaceCoords.left;
            const leftEdge = 0 - this._getCoords().firstHandle.width / 2;

            if (newLeft < leftEdge) newLeft = leftEdge;

            const rightEdge = freeSpaceCoords.width - this._getCoords().firstHandle.width / 2;

            if (newLeft > rightEdge) newLeft = rightEdge;

            const currentHandleXInPixels = freeSpaceCoords.left
              + newLeft
              + this._getCoords().firstHandle.width / 2;

            this.refreshValue({
              currentHandleCoordinate: currentHandleXInPixels,
              handleNumber,
            });
          }

          if (this.options.orientation === 'vertical') {
            const { y: shiftY } = handleShift;

            let newTop = mouseMoveEvent.pageY - shiftY - freeSpaceCoords.top;
            const topEdge = 0 - this._getCoords().firstHandle.height / 2;

            if (newTop < topEdge) newTop = topEdge;

            const bottomEdge = freeSpaceCoords.height - this._getCoords().firstHandle.height / 2;

            if (newTop > bottomEdge) newTop = bottomEdge;

            const currentHandleYInPixels = newTop
              + this._getCoords().firstHandle.height / 2
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
      handleOnDragStart: (): false => false,
    },
    sliderClick: (clickEvent: MouseEvent): void => {
      const areHandlesTargets = clickEvent.target === this.sliderHtml.firstHandle
        || clickEvent.target === this.sliderHtml.secondHandle;

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
    plugin: string;
    pluginView: SliderLabelsView | SliderTooltipView;
    number?: 'first' | 'second';
  }): void {
    if (plugin === 'labels') {
      pluginView.render(this.sliderHtml.wrapper);
    }

    if (plugin === 'tooltip') {
      const correctNumber = !number ? 'first' : number;

      const doesFirstHandleContainsTooltip = this.sliderHtml.firstHandle.contains(
        (pluginView as SliderTooltipView).html,
      );

      if (correctNumber === 'first') {
        if (!doesFirstHandleContainsTooltip) {
          pluginView.render(this.sliderHtml.firstHandle);
        }
      }

      if (correctNumber === 'second') {
        if (this.sliderHtml.secondHandle && !doesFirstHandleContainsTooltip) {
          pluginView.render(this.sliderHtml.secondHandle);
        }
      }
    }
  }

  destroyPlugin({ plugin, instance }: {
    plugin: 'labels' | 'tooltip';
    instance: SliderLabelsView | SliderTooltipView;
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

    const range = this.options.max - this.options.min;
    const { orientation } = this.options;
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

      const { min, max, step } = this.options;

      for (let currentValue = min; currentValue <= max; currentValue += step) {
        valuesArray.push(currentValue);
      }

      return valuesArray;
    };

    const valuesArray = getValuesArray();

    const valueInPercents = this.options.orientation === 'horizontal'
      ? currentHandlePosition / this._getCoords().wrapper.width
      : currentHandlePosition / this._getCoords().wrapper.height;

    const approximateValue = valueInPercents * range + this.options.min;

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
    const addHandleMovingHandler = (handle: HTMLElement): void => {
      handle.addEventListener(
        'mousedown',
        this.eventListeners.handleMoving.handleMouseDown,
      );

      // eslint-disable-next-line no-param-reassign
      handle.ondragstart = this.eventListeners.handleMoving.handleOnDragStart;
    };

    addHandleMovingHandler(this.sliderHtml.firstHandle);

    if (this.options.range === true) {
      addHandleMovingHandler(this.sliderHtml.secondHandle);
    }
  }

  private _setSliderClickHandler(): void {
    this.sliderHtml.wrapper.addEventListener(
      'click',
      this.eventListeners.sliderClick,
    );
  }

  private _renderHandlePositions(): void {
    const renderHandlePosition = (handleNumber: 'first' | 'second') => {
      const handle = handleNumber === 'first'
        ? this.sliderHtml.firstHandle
        : this.sliderHtml.secondHandle;
      const handleCoords = handleNumber === 'first'
        ? this._getCoords().firstHandle
        : this._getCoords().secondHandle;

      const handlePositionInPixels = this.handlesPositionInPixels[
        handleNumber === 'first' ? 0 : 1
      ];

      if (this.options.orientation === 'horizontal') {
        handle.style.left = `${
          handlePositionInPixels - handleCoords.width / 2
        }px`;
      }
      if (this.options.orientation === 'vertical') {
        handle.style.bottom = `${
          handlePositionInPixels - handleCoords.height / 2
        }px`;
      }
    };

    renderHandlePosition('first');

    if (this.options.range === true) renderHandlePosition('second');
  }

  private _renderRange() {
    const [firstHandle, secondHandle] = this.handlesPositionInPixels;
    const wrapperCoords = this._getCoords().wrapper;

    if (this.options.orientation === 'horizontal') {
      if (this.options.range === 'min') {
        this.sliderHtml.range.style.left = '0px';
        this.sliderHtml.range.style.width = `${firstHandle}px`;
      }

      if (this.options.range === 'max') {
        this.sliderHtml.range.style.right = '0px';
        this.sliderHtml.range.style.width = `${
          wrapperCoords.width - firstHandle
        }px`;
      }

      if (this.options.range === true) {
        this.sliderHtml.range.style.left = `${firstHandle}px`;
        this.sliderHtml.range.style.right = `${secondHandle}px`;
        this.sliderHtml.range.style.width = `${secondHandle - firstHandle}px`;
      }
    }
    if (this.options.orientation === 'vertical') {
      if (this.options.range === 'min') {
        this.sliderHtml.range.style.bottom = '0px';
        this.sliderHtml.range.style.height = `${firstHandle}px`;
      }

      if (this.options.range === 'max') {
        this.sliderHtml.range.style.top = '0px';
        this.sliderHtml.range.style.height = `${
          wrapperCoords.height - firstHandle
        }px`;
      }

      if (this.options.range === true) {
        this.sliderHtml.range.style.top = `${
          wrapperCoords.height - secondHandle
        }px`;
        this.sliderHtml.range.style.bottom = `${firstHandle}px`;
        this.sliderHtml.range.style.height = `${firstHandle - secondHandle}px`;
      }
    }
  }

  private _setSliderClasses(): void {
    const defaultClasses = Object.keys(this.options.classes) as (keyof (
      | VerticalClasses
      | HorizontalClasses
    ))[];
    const [wrapper, range, handle] = defaultClasses;

    this.sliderHtml.wrapper.setAttribute('class', wrapper);
    this.sliderHtml.range.setAttribute('class', range);
    this.sliderHtml.firstHandle.setAttribute('class', handle);

    this.sliderHtml.wrapper.style.position = 'relative';
    this.sliderHtml.range.style.position = 'absolute';
    this.sliderHtml.firstHandle.style.position = 'absolute';

    $(this.sliderHtml.wrapper).addClass(this.options.classes[wrapper]);
    $(this.sliderHtml.range).addClass(this.options.classes[range]);
    $(this.sliderHtml.firstHandle).addClass(this.options.classes[handle]);

    if (this.sliderHtml.secondHandle) {
      this.sliderHtml.secondHandle.setAttribute('class', handle);
      this.sliderHtml.secondHandle.style.position = 'absolute';
      $(this.sliderHtml.secondHandle).addClass(this.options.classes[handle]);
    }
  }

  private _setTransition(): void {
    const { animate } = this.options;

    const handleProp = this.options.orientation === 'horizontal' ? 'left' : 'bottom';

    const maybeNull = typeof animate === 'number' ? animate : 0;
    const maybeSevenHundredOrNull = animate === 'slow' ? 700 : maybeNull;

    const transitionMs: number = animate === 'fast' ? 300 : maybeSevenHundredOrNull;

    this.sliderHtml.firstHandle.style.transition = `${handleProp} ${transitionMs}ms`;
    this.sliderHtml.range.style.transition = `${transitionMs}ms`;

    const addTransitionToHandle = (handle: HTMLElement) => {
      const mousedownHandler = () => {
        // eslint-disable-next-line no-param-reassign
        handle.style.transition = '0ms';
        this.sliderHtml.range.style.transition = '0ms';
      };

      const mouseupHandler = () => {
        // eslint-disable-next-line no-param-reassign
        handle.style.transition = `${handleProp} ${transitionMs}ms`;
        this.sliderHtml.range.style.transition = `${transitionMs}ms`;
      };

      handle.addEventListener('mousedown', mousedownHandler);
      document.addEventListener('mouseup', mouseupHandler);
    };

    addTransitionToHandle(this.sliderHtml.firstHandle);

    if (this.options.range === true) {
      addTransitionToHandle(this.sliderHtml.secondHandle);
    }
  }

  private _setHandlePositionInPixels(): void {
    if (!this.data.rendered) return;

    this.handlesPositionInPixels = [];

    const { min, max, value } = this.options;
    const range = max - min;

    const firstValueInPercents = (
      (this.options.range === true
        ? (value as number[])[0]
        : (value as number)
      ) - this.options.min
    ) / range;

    const addHandlePosition = (handleValueInPercents: number): void => {
      this.handlesPositionInPixels.push(
        this.options.orientation === 'horizontal'
          ? this._getCoords().wrapper.width * handleValueInPercents
          : this._getCoords().wrapper.height * handleValueInPercents,
      );
    };

    addHandlePosition(firstValueInPercents);

    if (this.options.range === true) {
      const secondValueInPercents = (
        ((this.options.value as number[])[1] - this.options.min) / range
      );

      addHandlePosition(secondValueInPercents);
    }
  }

  private _setSliderElements(): void {
    const secondHandle = this.options.range === true ? document.createElement('div') : null;

    this.sliderHtml = {
      wrapper: document.createElement('div'),
      range: document.createElement('div'),
      firstHandle: document.createElement('div'),
      secondHandle,
    };

    this.sliderHtml.wrapper.append(this.sliderHtml.range);
    this.sliderHtml.wrapper.append(this.sliderHtml.firstHandle);

    if (this.options.range === true) this.sliderHtml.wrapper.append(this.sliderHtml.secondHandle);
  }

  private _countHandleShift({ mouseDownEvent, handleNumber }: {
    mouseDownEvent: MouseEvent;
    handleNumber: 'first' | 'second';
  }): Shift {
    const handle = handleNumber === 'first'
      ? this.sliderHtml.firstHandle
      : this.sliderHtml.secondHandle;

    return getShift(mouseDownEvent, handle);
  }

  private _hasClassesChanged(): boolean {
    if (!this.classesHash) return true;

    const { classes } = this.options;
    const hash = this.classesHash;

    Object.keys(this.options.classes).forEach(
      (mainClass: keyof Options['classes']) => {
        if (
          Object.prototype.hasOwnProperty.call(this.options.classes, mainClass)
        ) {
          const isClassSameAsInHash = mainClass in hash
            && classes[mainClass] === hash[mainClass];

          if (!isClassSameAsInHash) {
            return true;
          }
        }
      },
    );

    return false;
  }

  private _getCoords() {
    return {
      wrapper: getCoords(this.sliderHtml.wrapper),
      range: getCoords(this.sliderHtml.range),
      firstHandle: getCoords(this.sliderHtml.firstHandle),
      secondHandle:
        this.options.range === true
          ? getCoords(this.sliderHtml.secondHandle)
          : null,
    };
  }

  private _getClosestHandleNumber(coordinate: number): 'first' | 'second' {
    let handleNumber: 'first' | 'second';

    if (this.options.range !== true) return;

    if (this.options.orientation === 'horizontal') {
      const firstRight = this._getCoords().firstHandle.right;
      const secondLeft = this._getCoords().secondHandle.left;

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
      const firstTop = this._getCoords().firstHandle.top;
      const secondBottom = this._getCoords().secondHandle.bottom;

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
