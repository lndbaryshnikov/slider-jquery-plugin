import getCoords, { Coords } from '../../utils/getCoords';
import Observer from '../Observer/Observer';

interface LabelOptions {
  labels: boolean;
  pips: boolean;
  orientation: 'horizontal' | 'vertical';
  min: number;
  max: number;
  step: number;
  valueFunc?: (value?: number) => string | number;
}

class LabelsView {
  private sliderLabels: HTMLDivElement[];

  private options: LabelOptions;

  private root: HTMLElement | null = null;

  private labelHtml: HTMLDivElement | null = null;

  private labelClickedSubject = new Observer();

  get state(): { isRendered: boolean; isSet: boolean } {
    return {
      isRendered: !!(this.root && this.labelHtml),
      isSet: !!(this.options && this.sliderLabels),
    };
  }

  get labels(): HTMLDivElement[] {
    return this.sliderLabels;
  }

  setOptions(options: LabelOptions): void {
    if (!options.labels && !options.pips) return;

    if (this.state.isRendered) {
      this.destroy();
    }

    this.options = options;

    this._createLabels();
    this._setClasses();
    if (this.options.labels) this._setText();
    this._setClickHandler();
  }

  render(root: HTMLElement): void {
    this.root = root;

    const renderingOptions = this._getRenderingOptions();

    const {
      sliderSize,
      labelsArray,
      interval,
      widthOrHeight,
      leftOrBottom,
    } = renderingOptions;

    const scale = document.createElement('div');
    scale.setAttribute(
      'class',
      `jquery-slider-labels-scale jquery-slider-labels-scale-${this.options.orientation}`,
    );
    scale.style[widthOrHeight] = `${sliderSize}px`;

    root.append(scale);

    let currentLabelIndent = 0;

    labelsArray.forEach((label) => {
      scale.append(label);

      const labelSize = getCoords(label)[widthOrHeight];

      // eslint-disable-next-line no-param-reassign
      label.style[leftOrBottom] = `${currentLabelIndent - labelSize / 2}px`;

      if (this.options.pips) {
        const pip = label.children[0] as HTMLElement;
        const pipSize = getCoords(pip)[widthOrHeight];

        pip.style[leftOrBottom] = `${
          labelSize / 2 - pipSize / 2
        }px`;
      }

      currentLabelIndent += interval;
    });
    this.labelHtml = scale;
  }

  remove(): void {
    this.root.removeChild(this.labelHtml);
    this.root = null;
    this.labelHtml = null;
  }

  destroy(): void {
    if (this.state.isRendered) this.remove();
    this.sliderLabels = null;
    this.options = null;
  }

  whenUserClicksOnLabel(callback: (middleCoordinate: number) => void): void {
    this.labelClickedSubject.addObserver((middleCoordinate: number) => {
      callback(middleCoordinate);
    });
  }

  private _createLabels(): void {
    const labels: HTMLDivElement[] = [];
    const { min, max, step } = this.options;

    for (let value = min; value <= max; value += step) {
      labels.push(this._getLabel());
    }

    this.sliderLabels = labels;
  }

  private _getLabel(): HTMLDivElement {
    const label = document.createElement('div');

    label.setAttribute('class', 'jquery-slider-label');

    if (this.options.pips) {
      const pip = document.createElement('div');

      pip.setAttribute('class', 'jquery-slider-pip');
      label.append(pip);
    }
    return label;
  }

  private _setClasses(): void {
    const { orientation } = this.options;

    const areNoLabelsOrPipsRequired = !this.options.labels
      && !this.options.pips;

    if (areNoLabelsOrPipsRequired) return;

    this.sliderLabels.forEach((label) => {
      label.setAttribute('class', 'jquery-slider-label');
      label.classList.add(`jquery-slider-label-${orientation}`);

      if (this.options.pips) {
        const pip = label.children[0];

        pip.setAttribute('class', 'jquery-slider-pip');
        pip.classList.add(`jquery-slider-pip-${orientation}`);
      }
    });
  }

  private _setText(): void {
    if (!this.options.labels) return;

    const { min, step, valueFunc } = this.options;

    for (
      let i = 0, value = min;
      i < this.sliderLabels.length;
      i += 1, value += step
    ) {
      const label = this.sliderLabels[i];

      if (valueFunc) {
        label.innerHTML += String(valueFunc(value));
      } else label.innerHTML += String(value);
    }
  }

  private _setClickHandler(): void {
    this.sliderLabels.forEach((label) => {
      const clickHandler = (): void => {
        const labelCoords = getCoords(label);

        const middle = this.options.orientation === 'horizontal'
          ? labelCoords.left + labelCoords.width / 2
          : labelCoords.top + labelCoords.height / 2;

        this.labelClickedSubject.notifyObservers(middle);
      };

      label.addEventListener('click', clickHandler);
    });
  }

  private _getRenderingOptions(): {
    sliderSize: number;
    widthOrHeight: 'width' | 'height';
    leftOrBottom: 'left' | 'bottom';
    interval: number;
    labelsArray: HTMLDivElement[];
    } | null {
    const { orientation } = this.options;

    const widthOrHeight = orientation === 'horizontal' ? 'width' : 'height';
    const leftOrBottom = orientation === 'horizontal' ? 'left' : 'bottom';

    const sliderSize = getCoords(this.root)[widthOrHeight];

    let itemsOptimalInterval = this._getItemsOptimalInterval();

    const { max, min, step } = this.options;
    const scaleRange = (max - min) / step;

    const isRangeEqualsToTen = scaleRange % 10 === 0;
    const isRangeEqualsToFive = scaleRange % 5 === 0;

    if (isRangeEqualsToFive && scaleRange >= 40) {
      itemsOptimalInterval = Math.ceil(itemsOptimalInterval / 5) * 5;
    }

    if (isRangeEqualsToTen && scaleRange >= 100) {
      itemsOptimalInterval = Math.ceil(itemsOptimalInterval / 10) * 10;
    }

    if (!itemsOptimalInterval) return null;

    const filterLabelsArrayCallback = (item: HTMLDivElement, index: number): boolean => (
      index === 0 || index % itemsOptimalInterval === 0
    );

    const newLabelsArray = itemsOptimalInterval === 1
      ? [...this.labels]
      : this.labels.filter(filterLabelsArrayCallback);

    const defaultSizeInterval = sliderSize / (this.labels.length - 1);

    const newSizeInterval = defaultSizeInterval * itemsOptimalInterval;

    return {
      interval: newSizeInterval,
      labelsArray: newLabelsArray,
      sliderSize,
      widthOrHeight,
      leftOrBottom,
    };
  }

  private _getMaxItemCoords(): { maxLabelCoords: Coords; maxPipCoords: Coords } {
    const maxLabel = this.labels[this.labels.length - 2];
    const maxPip = this.options.pips ? maxLabel.children[0] as HTMLElement : null;

    this.root.append(maxLabel);

    const maxLabelCoords = getCoords(maxLabel);
    const maxPipCoords = maxPip && getCoords(maxPip);

    maxLabel.remove();

    return { maxLabelCoords, maxPipCoords };
  }

  private _getItemsOptimalInterval(): null | number {
    const { orientation } = this.options;
    const widthOrHeight = orientation === 'horizontal' ? 'width' : 'height';

    const { maxLabelCoords, maxPipCoords } = this._getMaxItemCoords();

    const maxLabelSize = maxLabelCoords[widthOrHeight];
    const maxPipSize = maxPipCoords ? maxPipCoords[widthOrHeight] : null;
    const sliderSize = getCoords(this.root)[widthOrHeight];

    const itemSize = this.labels ? maxLabelSize : maxPipSize;
    const itemsAmount = this.labels.length;

    const optimalPlaceSizeForItem = itemSize * 1.3;
    const maxItemsAmount = Math.floor((sliderSize + itemSize) / optimalPlaceSizeForItem);

    if (maxItemsAmount === 1) return null;
    if (maxItemsAmount >= itemsAmount) return 1;

    const minItemsInterval = Math.ceil(itemsAmount / maxItemsAmount);

    return minItemsInterval;
  }
}

export default LabelsView;
export { LabelOptions };
