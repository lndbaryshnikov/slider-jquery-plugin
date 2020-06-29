import getCoords, { Coords } from '../../utils/getCoords';
import { Shift } from '../../utils/getShift';
import Observer from '../Observer/Observer';
import { Options } from '../Model/modelOptions';
import RangeView from './RangeView';
import HandleView, { HandleNumber } from './HandleView';
import LabelsView, { LabelOptions } from './LabelsView';
import TooltipView from './TooltipView';

type MainStyles = {
  [key in 'range' | 'slider' | 'handle' | 'tooltip']?: string;
};

type ViewComponents = {
  range: RangeView;
  firstHandle: HandleView;
  secondHandle?: HandleView;
  firstTooltip?: TooltipView;
  secondTooltip?: TooltipView;
  labels?: LabelsView;
};

class MainView {
  private root: HTMLElement;

  private components: ViewComponents;

  private options: Options;

  private styles: MainStyles;

  private handlePositions: number[];

  private valueChangedSubject = new Observer();

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

  isRendered(): boolean {
    return !!this.root;
  }

  get html(): ViewComponents & { slider: HTMLElement } {
    return { ...{ slider: this.root }, ...this.components };
  }

  setOptions(options: Options): void {
    this.options = options;
    this.setStyles();

    if (this.isRendered()) {
      this.render();
    }
  }

  getOptions(): Options {
    return this.options;
  }

  setStyles(styles?: MainStyles): void {
    this.styles = styles || this.styles;
  }

  getStyles(): MainStyles {
    return this.styles;
  }

  render(root?: HTMLElement): void {
    this.root = root || this.root;
    this.root.className = 'jquery-slider';

    this._setElements();
    this._setSliderClickHandler();
    this._setUITransition();
    this._defineHandlePositions();
    this._renderHandles();
    this._renderRange();
  }

  destroy(): void {
    if (this.isRendered()) {
      this.root.remove();
    }
  }

  updateValue(value: Options['value']): void {
    this.options.value = value;

    this._defineHandlePositions();
    this._renderHandles();
    this._renderRange();
    this._updateTooltips();
  }

  refreshValue({ handleCoordinate, handleNumber }: {
    handleCoordinate: number;
    handleNumber?: 'first' | 'second';
  }): void {
    const maybeFirstOrClosest = this.options.range !== true
      ? 'first'
      : this._getClosestHandleNumber(handleCoordinate);

    const correctHandleNumber = handleNumber || maybeFirstOrClosest;
    const sliderCoords = this._getCoords();

    const isHorizontal = this.options.orientation === 'horizontal';
    const secondBorder = isHorizontal ? sliderCoords.right : sliderCoords.bottom;
    const firstBorder = isHorizontal ? sliderCoords.left : sliderCoords.top;

    const isOutOfSecondBorder = handleCoordinate > secondBorder;
    const isOutOfFirstBorder = handleCoordinate < firstBorder;
    const isOutOfBorders = isOutOfSecondBorder || isOutOfFirstBorder;

    if (isOutOfBorders) {
      const { max, min } = this.options;
      const horizontalMaxValue = isOutOfSecondBorder ? max : min;
      const verticalMaxValue = isOutOfSecondBorder ? min : max;

      this.valueChangedSubject.notifyObservers({
        value: isHorizontal ? horizontalMaxValue : verticalMaxValue,
        handleNumber: correctHandleNumber,
      });
      return;
    }
    const valueInPercents = this._getValueInPercents(handleCoordinate);
    const value = this._findExactValue(valueInPercents);

    this.valueChangedSubject.notifyObservers({ value, handleNumber: correctHandleNumber });
  }

  private _setElements(): void {
    this.root.innerHTML = '';
    this.components = {
      range: new RangeView(),
      firstHandle: new HandleView('first'),
    };
    const { root, styles } = this;

    root.classList.add(`jquery-slider_orientation_${this.options.orientation}`);
    if (styles && styles.slider) {
      root.classList.add(`jquery-slider_color_${styles.slider}`);
    }

    this._setRange();
    this._setHandles();
    this._setLabels();
    this._setTooltips();
  }

  private _setRange(): void {
    const { range } = this.components;
    range.stickTo(this.root);

    const { orientation } = this.options;
    range.setModifiers({ orientation, color: this.styles && this.styles.range });
  }

  private _setHandles(): void {
    const { range, orientation } = this.options;
    const handleModifiers = { orientation, color: this.styles && this.styles.handle };

    const setHandle = (handle: HandleView): void => {
      handle.stickTo(this.root);
      handle.whenMouseDown(this._allowHandleMoving.bind(this));
      handle.whenHandleMoved(this.refreshValue.bind(this));
      handle.setModifiers(handleModifiers);
    };

    const { firstHandle } = this.components;
    setHandle(firstHandle);

    if (range === true) {
      const secondHandle = new HandleView('second');
      setHandle(secondHandle);

      this.components.secondHandle = secondHandle;
    }
  }

  private _setLabels(): void {
    const {
      labels, pips, orientation, min, max, step,
    } = this.options;

    if (labels || pips) {
      this.components.labels = new LabelsView();
      const { labels: labelsView } = this.components;

      const updateHandlePosition = (handleCoordinate: number): void => {
        this.refreshValue({ handleCoordinate });
      };

      labelsView.whenUserClicksOnLabel(updateHandlePosition);

      const labelsOptions: LabelOptions = {
        labels: !!labels,
        valueFunction: typeof labels === 'function' ? labels : undefined,
        pips,
        orientation,
        min,
        max,
        step,
      };

      labelsView.setOptions(labelsOptions);
      labelsView.render(this.root);
    }
  }

  private _setTooltips(): void {
    const {
      range, tooltip, value, orientation,
    } = this.options;

    const setTooltip = (handleNumber: 'first' | 'second'): void => {
      const maybeFirstOrSecond = handleNumber === 'first' ? value[0] : value[1];
      const tooltipValue = !Array.isArray(value) ? value : maybeFirstOrSecond;

      const { firstTooltip, secondTooltip } = this.components;
      const tooltipView = handleNumber === 'first' ? firstTooltip : secondTooltip;
      const valueFunction = typeof tooltip === 'function' ? tooltip : null;

      tooltipView.setOptions({
        value: tooltipValue,
        orientation,
        valueFunction,
        style: this.styles && this.styles.tooltip,
      });

      const { firstHandle, secondHandle } = this.components;
      const handle = handleNumber === 'first' ? firstHandle : secondHandle;

      handle.renderTooltip(tooltipView);
    };

    if (tooltip) {
      this.components.firstTooltip = new TooltipView();
      setTooltip('first');

      if (range === true) {
        this.components.secondTooltip = new TooltipView();
        setTooltip('second');
      }
    }
  }

  private _allowHandleMoving({ handleNumber, cursorShift }: {
    handleNumber: HandleNumber;
    cursorShift: Shift;
  }): void {
    this._cleanUITransition();

    const { firstHandle, secondHandle } = this.components;
    const targetHandle = handleNumber === 'first' ? firstHandle : secondHandle;

    const { orientation } = this.options;
    const availableSpace = this._countAvailableHandleSpace(handleNumber);

    targetHandle.allowMovingWithinSpace({ cursorShift, availableSpace, orientation });
  }

  private _setSliderClickHandler(): void {
    const sliderClickHandler = (clickEvent: MouseEvent): void => {
      const { firstHandle, secondHandle } = this.components;
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
        handleCoordinate: coordinateToMove,
        handleNumber,
      });
    };

    this.root.addEventListener(
      'click',
      sliderClickHandler,
    );
  }

  private _setUITransition(): void {
    const { animate } = this.options;

    const maybeNull = typeof animate === 'number' ? animate : 0;
    const maybeSevenHundredOrNull = animate === 'slow' ? 700 : maybeNull;
    const transitionMs: number = animate === 'fast' ? 300 : maybeSevenHundredOrNull;

    const { firstHandle, secondHandle, range } = this.components;

    const applyTransition = (): void => {
      firstHandle.setTransition(transitionMs);
      if (secondHandle) secondHandle.setTransition(transitionMs);
      range.setTransition(transitionMs);
    };

    applyTransition();

    document.addEventListener('mouseup', applyTransition);
  }

  private _cleanUITransition(): void {
    const { firstHandle, secondHandle, range } = this.components;

    firstHandle.setTransition(0);
    if (secondHandle) secondHandle.setTransition(0);
    range.setTransition(0);
  }

  private _defineHandlePositions(): void {
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

    this.handlePositions = positions;
  }

  private _renderHandles(): void {
    const { firstHandle, secondHandle } = this.components;
    const [firstHandlePositionInPx, secondHandlePositionInPx] = this.handlePositions;

    const moveFrom = this.options.orientation === 'horizontal' ? 'left' : 'bottom';

    firstHandle.moveTo({ moveFrom, value: firstHandlePositionInPx });

    if (this.options.range === true) {
      secondHandle.moveTo({ moveFrom, value: secondHandlePositionInPx });
    }
  }

  private _renderRange(): void {
    const { range } = this.options;

    if (range === false) return;

    const [firstHandlePosition, secondHandlePosition] = this.handlePositions;
    const { width: sliderWidth, height: sliderHeight } = this._getCoords();
    const { orientation } = this.options;

    const sliderStart = 0;
    const sliderEnd = orientation === 'horizontal' ? sliderWidth : sliderHeight;

    const firstPoint = range === 'min' ? sliderStart : firstHandlePosition;
    const endMaybeFirstOrSecond = range === 'min' ? firstHandlePosition : secondHandlePosition;
    const secondPoint = range === 'max' ? sliderEnd : endMaybeFirstOrSecond;

    this.components.range.setPosition({ orientation, firstPoint, secondPoint });
  }

  private _updateTooltips(): void {
    const { firstTooltip, secondTooltip } = this.components;
    const { value, range, tooltip: tooltipOption } = this.options;

    const valueFunction = typeof tooltipOption === 'function' ? tooltipOption : null;
    const updateTooltip = ({ tooltip, tooltipValue }: {
      tooltip: TooltipView;
      tooltipValue: number;
    }): void => {
      if (tooltip && tooltip.state.isRendered) {
        tooltip.setValue({
          value: tooltipValue, valueFunction,
        });
      }
    };

    const firstValue = range === true ? value[0] : value as number;
    updateTooltip({ tooltip: firstTooltip, tooltipValue: firstValue });

    const secondValue = range === true ? value[1] : undefined;
    updateTooltip({ tooltip: secondTooltip, tooltipValue: secondValue });
  }

  private _getValueInPercents(handleCoordinate: number): number {
    const sliderCoords = this._getCoords();
    const isHorizontal = this.options.orientation === 'horizontal';

    const currentHandlePosition = isHorizontal
      ? handleCoordinate - sliderCoords.left
      : sliderCoords.height - (handleCoordinate - sliderCoords.top);

    const valueInPercents = isHorizontal
      ? currentHandlePosition / sliderCoords.width
      : currentHandlePosition / sliderCoords.height;

    return valueInPercents;
  }

  private _findExactValue(valueInPercents: number): number {
    const { max, min } = this.options;
    const difference = max - min;
    const approximateValue = valueInPercents * difference + min;
    const valuesArray = this._getValuesArray();

    let exactValue: number;

    valuesArray.some((value, i) => {
      const nextValue = valuesArray[i + 1];
      const isValueBetweenTheseTwo = approximateValue >= value
        && approximateValue <= nextValue;

      if (isValueBetweenTheseTwo) {
        const rangeFromFirst = approximateValue - value;
        const rangeFromSecond = nextValue - approximateValue;

        exactValue = rangeFromFirst < rangeFromSecond ? value : nextValue;

        return true;
      }
      return false;
    });
    return exactValue;
  }

  private _getValuesArray(): number[] {
    const valuesArray: number[] = [];
    const { min, max, step } = this.options;

    for (let currentValue = min; currentValue <= max; currentValue += step) {
      valuesArray.push(currentValue);
    }
    return valuesArray;
  }

  private _getClosestHandleNumber(coordinate: number): 'first' | 'second' {
    let handleNumber: 'first' | 'second';

    const { orientation, range } = this.options;
    const { firstHandle, secondHandle } = this.components;

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
    } else {
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
    const { firstHandle, secondHandle } = this.components;
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

  private _getCoords(): Coords {
    return getCoords(this.root);
  }
}

export default MainView;
export { MainStyles };
