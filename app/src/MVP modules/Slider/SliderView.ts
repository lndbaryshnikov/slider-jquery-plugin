import { getShift, Shift } from '../../functions/common/getShift';
import getCoords, { Coords } from '../../functions/common/getCoords';
import Observer from '../Observer';
import SliderTooltipView from '../SliderTooltipView';
import SliderLabelsView from '../SliderLabelsView';
import { HorizontalClasses, Options, VerticalClasses } from './SliderModel';

interface Html {
  wrapper: HTMLDivElement | null;
  range: HTMLDivElement | null;
  firstHandle: HTMLDivElement | null;
  secondHandle: HTMLDivElement | null;
}
export default class SliderView {
  private _html: Html | null = null;

  private _root: HTMLElement | null = null;

  private _options: Options | null = null;

  private _classesHash: Options['classes'] | null = null;

  private _handlesPositionInPixels: number[] | null = null;

  private _data = {
    rendered: false,
  };

  private _eventListeners = {
    handleMoving: {
      handleMouseDown: (mouseDownEvent: MouseEvent): false => {
        let freeSpaceCoords: Coords;
        const targetHandle = mouseDownEvent.target;

        const { orientation } = this._options;

        const isRangeTrue = this._options.range === true;
        const isFirstHandleTarget = targetHandle === this._html.firstHandle;
        const isSecondHandleTarget = targetHandle === this._html.secondHandle;

        if (!isRangeTrue && isFirstHandleTarget) {
          freeSpaceCoords = this._getCoords().wrapper;
        }

        if (isRangeTrue) {
          freeSpaceCoords = this._getCoords().wrapper;

          const firstHandleCoords = this._getCoords().firstHandle;
          const secondHandleCoords = this._getCoords().secondHandle;

          if (isFirstHandleTarget) {
            if (orientation === 'horizontal') {
              freeSpaceCoords.right = secondHandleCoords.left
                                - firstHandleCoords.width / 2;

              freeSpaceCoords.width = freeSpaceCoords.right - freeSpaceCoords.left;
            }

            if (orientation === 'vertical') {
              freeSpaceCoords.top = secondHandleCoords.bottom + firstHandleCoords.height / 2;

              freeSpaceCoords.height = freeSpaceCoords.bottom - freeSpaceCoords.top;
            }
          }

          if (isSecondHandleTarget) {
            if (orientation === 'horizontal') {
              freeSpaceCoords.left = firstHandleCoords.right
                                + secondHandleCoords.width / 2;

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

        const handleShift = this._countHandleShift(mouseDownEvent, handleNumber);

        const mouseMoveHandler = (mouseMoveEvent: MouseEvent) => {
          if (this._options.orientation === 'horizontal') {
            const shiftX = handleShift.x;

            let newLeft = mouseMoveEvent.pageX - shiftX - freeSpaceCoords.left;

            if (newLeft < 0 - this._getCoords().firstHandle.width / 2) {
              newLeft = 0 - this._getCoords().firstHandle.width / 2;
            }

            const rightEdge = freeSpaceCoords.width - this._getCoords().firstHandle.width;

            if (newLeft > rightEdge + this._getCoords().firstHandle.width / 2) {
              newLeft = rightEdge + this._getCoords().firstHandle.width / 2;
            }

            const currentHandleXInPixels = freeSpaceCoords.left
                            + newLeft + this._getCoords().firstHandle.width / 2;

            this.refreshValue(currentHandleXInPixels, handleNumber);
          }

          if (this._options.orientation === 'vertical') {
            const shiftY = handleShift.y;

            let newTop = mouseMoveEvent.pageY - shiftY - freeSpaceCoords.top;

            if (newTop < 0 - this._getCoords().firstHandle.height / 2) {
              newTop = 0 - this._getCoords().firstHandle.height / 2;
            }

            const rightEdge = freeSpaceCoords.height - this._getCoords().firstHandle.height;

            if (newTop > rightEdge + this._getCoords().firstHandle.height / 2) {
              newTop = rightEdge + this._getCoords().firstHandle.height / 2;
            }

            const currentHandleYInPixels = newTop + this._getCoords().firstHandle.height / 2
                            + freeSpaceCoords.top;

            this.refreshValue(currentHandleYInPixels, handleNumber);
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
      const areHandlesTargets = clickEvent.target === this._html.firstHandle
                || clickEvent.target === this._html.secondHandle;

      if (areHandlesTargets) {
        return;
      }

      let coordinateToMove: number;
      let handleNumber: 'first' | 'second' = 'first';

      if (this._options.orientation === 'horizontal') {
        coordinateToMove = clickEvent.pageX;
      }

      if (this._options.orientation === 'vertical') {
        coordinateToMove = clickEvent.pageY;
      }

      if (this._options.range === true) {
        handleNumber = this._getClosestHandleNumber(coordinateToMove);
      }

      this.refreshValue(coordinateToMove, handleNumber);
    },
  };

  private _valueChangedSubject = new Observer();

  whenValueChanged(callback: (valueData: [number, 'first' | 'second']) => void): void {
    this._valueChangedSubject.addObserver((valueData: [number, 'first' | 'second']) => {
      callback(valueData);
    });
  }

  get html(): Html {
    return this._html;
  }

  get value(): number | number[] {
    return this._options.value;
  }

  render(root: HTMLElement): void {
    this._root = root;
    this._root.append(this._html.wrapper);

    this._data.rendered = true;

    this._setHandlePositionInPixels();

    this._renderOptions();
  }

  destroy(): void {
    this._html = undefined;
    this._root = undefined;
    this._options = undefined;
    this._handlesPositionInPixels = undefined;

    this._data.rendered = false;
  }

  cleanDom(): void {
    const isRendered = !!this._root || this._root.contains(this._html.wrapper);

    if (isRendered) {
      this._html.wrapper.remove();
    }

    this._data.rendered = false;
  }

  setOptions(options: Options): void {
    this._options = options;

    const wasRendered = this._data.rendered;

    let rootSnapshot: null | HTMLElement = null;

    if (wasRendered) {
      rootSnapshot = this._root;

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
    this._options.value = value;

    this._setHandlePositionInPixels();
    this._renderHandlePositions();
    this._renderRange();
  }

  renderPlugin(
    plugin: string,
    pluginView: SliderLabelsView | SliderTooltipView,
    number?: 'first' | 'second',
  ): void {
    if (plugin === 'labels') {
      pluginView.render(this._html.wrapper);
    }

    if (plugin === 'tooltip') {
      const correctNumber = !number ? 'first' : number;

      const doesFirstHandleContainsTooltip = this._html.firstHandle
        .contains((pluginView as SliderTooltipView).html);

      if (correctNumber === 'first') {
        if (!doesFirstHandleContainsTooltip) {
          pluginView.render(this._html.firstHandle);
        }
      }

      if (correctNumber === 'second') {
        if (this._html.secondHandle && !doesFirstHandleContainsTooltip) {
          pluginView.render(this._html.secondHandle);
        }
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  destroyPlugin(plugin: 'labels' | 'tooltip', pluginView: SliderLabelsView | SliderTooltipView): void {
    if (plugin === 'labels' || plugin === 'tooltip') {
      pluginView.destroy();
    }
  }

  refreshValue(currentHandleCoordinate: number, handleNumber?: 'first' | 'second'): void {
    let correctHandleNumber: 'first' | 'second';

    if (!correctHandleNumber) {
      if (this._options.range !== true) correctHandleNumber = 'first';
      else {
        correctHandleNumber = this._getClosestHandleNumber(currentHandleCoordinate);
      }
    } else {
      correctHandleNumber = handleNumber;
    }

    const range = this._options.max - this._options.min;
    const { orientation } = this._options;
    const wrapperCoords = this._getCoords().wrapper;

    const isHorizontal = orientation === 'horizontal';

    const wrapperStart = isHorizontal ? wrapperCoords.left : wrapperCoords.top;
    const wrapperEnd = isHorizontal ? wrapperCoords.right : wrapperCoords.bottom;

    if (currentHandleCoordinate > wrapperEnd) {
      this._valueChangedSubject
        .notifyObservers(
          [isHorizontal ? this._options.max : this._options.min, correctHandleNumber],
        );

      return;
    }

    if (currentHandleCoordinate < wrapperStart) {
      this._valueChangedSubject
        .notifyObservers(
          [isHorizontal ? this._options.min : this._options.max, correctHandleNumber],
        );

      return;
    }

    const currentHandlePosition = orientation === 'horizontal'
      ? currentHandleCoordinate - wrapperCoords.left
      : wrapperCoords.height - (currentHandleCoordinate - wrapperCoords.top);

    const getValuesArray = (): number[] => {
      const valuesArray: number[] = [];

      for (let currentValue = this._options.min;
        currentValue <= this._options.max; currentValue += this._options.step) {
        valuesArray.push(currentValue);
      }

      return valuesArray;
    };

    const valuesArray = getValuesArray();

    const valueInPercents = this._options.orientation === 'horizontal'
      ? currentHandlePosition / this._getCoords().wrapper.width
      : currentHandlePosition / this._getCoords().wrapper.height;

    const approximateValue = valueInPercents * range + this._options.min;

    let value: number;

    for (let i = 0; i < valuesArray.length; i += 1) {
      if (approximateValue >= valuesArray[i] && approximateValue <= valuesArray[i + 1]) {
        const rangeFromFirst = approximateValue - valuesArray[i];
        const rangeFromSecond = valuesArray[i + 1] - approximateValue;

        value = rangeFromFirst < rangeFromSecond
          ? valuesArray[i] : valuesArray[i + 1];

        break;
      }
    }

    this._valueChangedSubject.notifyObservers([value, correctHandleNumber]);
  }

  private _renderOptions(): void {
    if (!this._data.rendered) return;

    this._renderHandlePositions();

    this._renderRange();
  }

  private _setHandleMovingHandler(): void {
    const addHandleMovingHandler = (handle: HTMLElement): void => {
      handle.addEventListener('mousedown', this._eventListeners.handleMoving.handleMouseDown);

      // eslint-disable-next-line no-param-reassign
      handle.ondragstart = this._eventListeners.handleMoving.handleOnDragStart;
    };

    addHandleMovingHandler(this._html.firstHandle);

    if (this._options.range === true) {
      addHandleMovingHandler(this._html.secondHandle);
    }
  }

  private _setSliderClickHandler(): void {
    this._html.wrapper.addEventListener('click', this._eventListeners.sliderClick);
  }

  private _renderHandlePositions(): void {
    const renderHandlePosition = (handleNumber: 'first' | 'second') => {
      const handle = handleNumber === 'first' ? this._html.firstHandle : this._html.secondHandle;
      const handleCoords = handleNumber === 'first' ? this._getCoords().firstHandle
        : this._getCoords().secondHandle;

      const handlePositionInPixels = this._handlesPositionInPixels[handleNumber === 'first' ? 0 : 1];

      if (this._options.orientation === 'horizontal') {
        handle.style.left = `${handlePositionInPixels - handleCoords.width / 2}px`;
      }
      if (this._options.orientation === 'vertical') {
        handle.style.bottom = `${handlePositionInPixels - handleCoords.height / 2}px`;
      }
    };

    renderHandlePosition('first');

    if (this._options.range === true) renderHandlePosition('second');
  }

  private _renderRange() {
    const positions = this._handlesPositionInPixels;
    const wrapperCoords = this._getCoords().wrapper;

    if (this._options.orientation === 'horizontal') {
      if (this._options.range === 'min') {
        this._html.range.style.left = `${0}px`;
        this._html.range.style.width = `${positions[0]}px`;
      }

      if (this._options.range === 'max') {
        this._html.range.style.right = `${0}px`;
        this._html.range.style.width = `${wrapperCoords.width
                    - positions[0]}px`;
      }

      if (this._options.range === true) {
        this._html.range.style.left = `${positions[0]}px`;
        this._html.range.style.right = `${positions[1]}px`;
        this._html.range.style.width = `${positions[1] - positions[0]}px`;
      }
    }
    if (this._options.orientation === 'vertical') {
      if (this._options.range === 'min') {
        this._html.range.style.bottom = `${0}px`;
        this._html.range.style.height = `${positions[0]}px`;
      }

      if (this._options.range === 'max') {
        this._html.range.style.top = `${0}px`;
        this._html.range.style.height = `${wrapperCoords.height
                    - positions[0]}px`;
      }

      if (this._options.range === true) {
        this._html.range.style.top = `${wrapperCoords.height - positions[1]}px`;
        this._html.range.style.bottom = `${positions[0]}px`;
        this._html.range.style.height = `${positions[0] - positions[1]}px`;
      }
    }
  }

  private _setSliderClasses(): void {
    const defaultClasses = Object.keys(this._options.classes) as
            (keyof (VerticalClasses | HorizontalClasses))[];
    const wrapper = defaultClasses[0];
    const range = defaultClasses[1];
    const handle = defaultClasses[2];

    this._html.wrapper.setAttribute('class', wrapper);
    this._html.range.setAttribute('class', range);
    this._html.firstHandle.setAttribute('class', handle);

    this._html.wrapper.style.position = 'relative';
    this._html.range.style.position = 'absolute';
    this._html.firstHandle.style.position = 'absolute';

    $(this._html.wrapper).addClass(this._options.classes[wrapper]);
    $(this._html.range).addClass(this._options.classes[range]);
    $(this._html.firstHandle).addClass(this._options.classes[handle]);

    if (this._html.secondHandle) {
      this._html.secondHandle.setAttribute('class', handle);
      this._html.secondHandle.style.position = 'absolute';
      $(this._html.secondHandle).addClass(this._options.classes[handle]);
    }
  }

  private _setTransition(): void {
    const { animate } = this._options;

    const handleProp = this._options.orientation === 'horizontal' ? 'left' : 'bottom';

    const maybeCustom = typeof animate === 'number' ? animate : 0;
    const maybeSlowOrCustom = animate === 'slow' ? 700 : maybeCustom;

    const transitionMs: number = animate === 'fast' ? 300 : maybeSlowOrCustom;

    this._html.firstHandle.style.transition = `${handleProp} ${transitionMs}ms`;
    this._html.range.style.transition = `${transitionMs}ms`;

    const addTransitionToHandle = (handle: HTMLElement) => {
      handle.addEventListener('mousedown', () => {
        // eslint-disable-next-line no-param-reassign
        handle.style.transition = '0ms';
        this._html.range.style.transition = '0ms';
      });

      document.addEventListener('mouseup', () => {
        // eslint-disable-next-line no-param-reassign
        handle.style.transition = `${handleProp} ${transitionMs}ms`;
        this._html.range.style.transition = `${transitionMs}ms`;
      });
    };

    addTransitionToHandle(this._html.firstHandle);

    if (this._options.range === true) {
      addTransitionToHandle(this._html.secondHandle);
    }
  }

  private _setHandlePositionInPixels(): void {
    if (!this._data.rendered) return;

    this._handlesPositionInPixels = null;
    this._handlesPositionInPixels = [];

    const range = this._options.max - this._options.min;

    const firstValueInPercents = ((this._options.range === true
      ? (this._options.value as number[])[0]
      : this._options.value as number) - this._options.min) / range;

    const addHandlePosition = (handleValueInPercents: number): void => {
      this._handlesPositionInPixels.push(this._options.orientation === 'horizontal'
        ? this._getCoords().wrapper.width * handleValueInPercents
        : this._getCoords().wrapper.height * handleValueInPercents);
    };

    addHandlePosition(firstValueInPercents);

    if (this._options.range === true) {
      const secondValueInPercents = ((this._options.value as number[])[1] - this._options.min)
        / range;

      addHandlePosition(secondValueInPercents);
    }
  }

  private _setSliderElements(): void {
    const secondHandle = this._options.range === true ? document.createElement('div') : null;

    this._html = {
      wrapper: document.createElement('div'),
      range: document.createElement('div'),
      firstHandle: document.createElement('div'),
      secondHandle,
    };

    this._html.wrapper.append(this._html.range);
    this._html.wrapper.append(this._html.firstHandle);

    if (this._options.range === true) this._html.wrapper.append(this._html.secondHandle);
  }

  private _countHandleShift(mouseDownEvent: MouseEvent, handleNumber: 'first' | 'second'): Shift {
    const handle = handleNumber === 'first' ? this._html.firstHandle : this._html.secondHandle;

    return getShift(mouseDownEvent, handle);
  }

  private _hasClassesChanged(): boolean {
    if (!this._classesHash) return true;

    const { classes } = this._options;
    const hash = this._classesHash;

    let mainClass: keyof Options['classes'];

    // eslint-disable-next-line no-restricted-syntax
    for (mainClass in this._options.classes) {
      if (Object.prototype.hasOwnProperty.call(this._options.classes, mainClass)) {
        if (!(mainClass in hash && classes[mainClass] === hash[mainClass])) {
          return true;
        }
      }
    }

    return false;
  }

  private _getCoords() {
    return {
      wrapper: getCoords(this._html.wrapper),
      range: getCoords(this._html.range),
      firstHandle: getCoords(this._html.firstHandle),
      secondHandle: this._options.range === true ? getCoords(this._html.secondHandle) : null,
    };
  }

  private _getClosestHandleNumber(coordinate: number): 'first' | 'second' {
    let handleNumber: 'first' | 'second';

    if (this._options.range !== true) return;

    if (this._options.orientation === 'horizontal') {
      const firstRight = this._getCoords().firstHandle.right;
      const secondLeft = this._getCoords().secondHandle.left;

      if (coordinate < secondLeft && coordinate > firstRight) {
        const firstDistance = coordinate - firstRight;
        const secondDistance = secondLeft - coordinate;

        handleNumber = firstDistance > secondDistance ? 'second' : 'first';
      }

      if (coordinate < firstRight) handleNumber = 'first';
      if (coordinate > secondLeft) handleNumber = 'second';
    }

    if (this._options.orientation === 'vertical') {
      const firstTop = this._getCoords().firstHandle.top;
      const secondBottom = this._getCoords().secondHandle.bottom;

      if (coordinate > secondBottom && coordinate < firstTop) {
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
