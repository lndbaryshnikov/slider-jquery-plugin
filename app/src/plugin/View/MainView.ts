import RangeView from './RangeView';
import HandleView from './HandleView';
import { Options } from '../Model/modelOptions';
import getCoords, { Coords } from '../../utils/getCoords';
import Observer from '../Observer/Observer';
import LabelsView from './LabelsView';
import TooltipView from './TooltipView';

type UserClasses = {
  slider: string;
  range: string;
  handle: string;
};

type PluginHtml = {
  slider: HTMLDivElement;
  range: RangeView;
  firstHandle: HandleView;
  secondHandle?: HandleView;
};

class MainView {
  private pluginHtml: PluginHtml;

  private options: Options;

  private classes: UserClasses;

  private root: HTMLElement;

  private handlesPositionInPixels: number[];

  private valueChangedSubject = new Observer();

  isRendered(): boolean {
    const { root } = this;
    return root && root.contains(this.pluginHtml.slider);
  }

  whenValueChanged(
    callback: (optionValue: Options['value']) => void,
  ): void {
    this.valueChangedSubject.addObserver(
      ({ value, handleNumber }: {
        value: number;
        handleNumber: 'first' | 'second';
      }) => {
        let optionValue: Options['value'];
        const { value: lastOptionValue } = this.options;

        if (Array.isArray(lastOptionValue)) {
          const [firstLastValue, secondLastValue] = lastOptionValue;

          optionValue = handleNumber === 'first'
            ? [value, secondLastValue]
            : [firstLastValue, value];
        } else {
          optionValue = value;
        }

        callback(optionValue);
      },
    );
  }

  get html(): PluginHtml {
    return this.pluginHtml;
  }

  setClasses(classes: UserClasses): void {
    this.classes = classes || this.classes || {
      slider: '',
      range: '',
      handle: '',
    };
  }

  getClasses(): UserClasses {
    return this.classes;
  }

  setOptions(options: Options): void {
    this.options = options;

    const wasRendered = this.isRendered();

    this.cleanDom();
    this._setElements();
    this._setHandleMovingHandler();
    this._setSliderClickHandler();

    this._setElementsClasses();
    this._setTransition();
    this._setHandlePositionInPixels();

    if (wasRendered) {
      this.render(this.root);
    }
  }

  render(root: HTMLElement): void {
    this.root = root;
    this.root.append(this.pluginHtml.slider);

    this._setHandlePositionInPixels();
    this._renderHandlePositions();
    this._renderRange();
  }

  cleanDom(): void {
    if (!this.isRendered()) return;

    this.pluginHtml.slider.remove();
  }

  updateValue(value: Options['value']): void {
    this.options.value = value;

    this._setHandlePositionInPixels();
    this._renderHandlePositions();
    this._renderRange();
  }

  refreshHandlePosition({ currentHandleCoordinate, handleNumber }: {
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
      this.valueChangedSubject.notifyObservers({
        value: isHorizontal ? max : min,
        handleNumber: correctHandleNumber,
      });

      return;
    }

    if (currentHandleCoordinate < firstBorder) {
      this.valueChangedSubject.notifyObservers({
        value: isHorizontal ? min : max,
        handleNumber: correctHandleNumber,
      });

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

    this.valueChangedSubject.notifyObservers({ value, handleNumber: correctHandleNumber });
  }

  renderPlugin({ plugin, pluginView, number }: {
    plugin: 'tooltip' | 'labels';
    pluginView: TooltipView | LabelsView;
    number?: 'first' | 'second';
  }): void {
    const { slider, firstHandle, secondHandle } = this.pluginHtml;

    if (plugin === 'labels') {
      pluginView.render(slider);
    }

    if (plugin === 'tooltip') {
      const handle = !number || number === 'first' ? firstHandle : secondHandle;

      const doesNotContainTooltip = handle && !handle.doesContainTooltip();
      if (doesNotContainTooltip) {
        handle.renderTooltip(pluginView as TooltipView);
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

  private _setElementsClasses(): void {
    const mainClasses = {
      slider: 'jquery-slider',
      range: 'jquery-slider-range',
      handle: 'jquery-slider-handle',
    };
    const orientation = this.options.orientation === 'horizontal'
      ? 'jquery-slider-horizontal' : 'jquery-slider-vertical';
    const customClasses = this.classes || {
      slider: '',
      range: '',
      handle: '',
    };

    const {
      slider: defaultSlider,
      range: defaultRange,
      handle: defaultHandle,
    } = mainClasses;
    const {
      slider: customSlider,
      range: customRange,
      handle: customHandle,
    } = customClasses;

    const sliderClass = `${defaultSlider} ${orientation} ${customSlider || ''}`;
    const rangeClass = `${defaultRange} ${customRange || ''}`;
    const handleClass = `${defaultHandle} ${customHandle || ''}`;

    const {
      slider, range, firstHandle, secondHandle,
    } = this.pluginHtml;

    slider.className = `${sliderClass}`;
    range.setClass(rangeClass);
    firstHandle.setClass(handleClass);

    if (secondHandle) {
      secondHandle.setClass(defaultHandle, customHandle);
    }
  }

  private _setElements(): void {
    this.pluginHtml = {
      slider: document.createElement('div'),
      range: new RangeView(),
      firstHandle: new HandleView('first'),
    };

    const { slider, firstHandle, range } = this.pluginHtml;

    slider.style.position = 'relative';
    range.stickTo(slider);
    firstHandle.stickTo(slider);

    if (this.options.range === true) {
      const secondHandle = new HandleView('second');
      secondHandle.stickTo(slider);

      this.pluginHtml.secondHandle = secondHandle;
    }
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

        this.refreshHandlePosition({
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

    const { firstHandle, secondHandle } = this.pluginHtml;

    firstHandle.onMousedown(mouseDownHandler);

    if (this.options.range === true) {
      secondHandle.onMousedown(mouseDownHandler);
    }
  }

  private _setSliderClickHandler(): void {
    const sliderClickHandler = (clickEvent: MouseEvent): void => {
      const { firstHandle, secondHandle } = this.pluginHtml;
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

      this.refreshHandlePosition({
        currentHandleCoordinate: coordinateToMove,
        handleNumber,
      });
    };

    this.pluginHtml.slider.addEventListener(
      'click',
      sliderClickHandler,
    );
  }

  private _setTransition(): void {
    const { animate } = this.options;

    const maybeNull = typeof animate === 'number' ? animate : 0;
    const maybeSevenHundredOrNull = animate === 'slow' ? 700 : maybeNull;
    const transitionMs: number = animate === 'fast' ? 300 : maybeSevenHundredOrNull;

    const { firstHandle, range } = this.pluginHtml;

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

    const setUITransition = (handle: HandleView): void => {
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

    setUITransition(firstHandle);

    if (this.options.range === true) {
      const { secondHandle } = this.pluginHtml;

      setUITransition(secondHandle);
    }
  }

  private _setHandlePositionInPixels(): void {
    if (!this.isRendered()) return;

    const positions = [];

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
      positions.push(
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

    this.handlesPositionInPixels = positions;
  }

  private _renderHandlePositions(): void {
    const { firstHandle, secondHandle } = this.pluginHtml;
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

    this.pluginHtml.range.setUp({ orientation, firstPoint, secondPoint });
  }

  private _getClosestHandleNumber(coordinate: number): 'first' | 'second' {
    let handleNumber: 'first' | 'second';

    const { orientation, range } = this.options;
    const { firstHandle, secondHandle } = this.pluginHtml;

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

  private _countAvailableHandleSpace(
    targetHandleNumber: 'first' | 'second',
  ): Omit<Coords, 'centerX' | 'centerY'> {
    const { firstHandle, secondHandle } = this.pluginHtml;
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
    const { firstHandle, secondHandle } = this.pluginHtml;
    const maybeSecond = secondHandle && secondHandle.isEventTarget(eventTarget)
      ? secondHandle : false;

    return firstHandle.isEventTarget(eventTarget) ? firstHandle : maybeSecond;
  }

  private _getCoords(): Coords {
    return getCoords(this.pluginHtml.slider);
  }
}

export default MainView;
export { UserClasses };
