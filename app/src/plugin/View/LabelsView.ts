import getCoords, { Coords } from '../../utils/getCoords';
import Observer from '../Observer/Observer';

interface LabelOptions {
  labels: boolean;
  pips: boolean;
  orientation: 'horizontal' | 'vertical';
  min: number;
  max: number;
  step: number;
  valueFunction?: (value?: number) => string | number;
}

class LabelsView {
  private sliderLabels: HTMLDivElement[];

  private options: LabelOptions;

  private root: HTMLElement;

  private labelHtml: HTMLDivElement;

  private labelClickedSubject = new Observer();

  get state(): { isRendered: boolean; isSet: boolean } {
    return {
      isRendered: !!(this.root && this.root.contains(this.labelHtml)),
      isSet: !!(this.options && this.sliderLabels),
    };
  }

  get labels(): HTMLDivElement[] {
    return this.sliderLabels;
  }

  setOptions(options: LabelOptions): void {
    const { labels, pips } = options;
    if (!labels && !pips) return;

    this.options = options;

    this.createLabels();
    this.setClasses();
    if (labels) this.setValue();
    this.setClickHandler();
  }

  render(root: HTMLElement): void {
    this.root = root;

    const renderingOptions = this.getRenderingOptions();

    const {
      sliderSize,
      interval,
      labelsArray,
      sizeProperty,
      positionProperty,
    } = renderingOptions;

    const scale = document.createElement('div');
    scale.setAttribute(
      'class',
      `jquery-slider__scale jquery-slider__scale_orientation_${this.options.orientation}`,
    );
    scale.style[sizeProperty] = `${sliderSize}px`;

    root.append(scale);

    let currentLabelIndent = 0;

    labelsArray.forEach((label) => {
      scale.append(label);

      const labelSize = this.getLabelCoords(label)[sizeProperty];
      // eslint-disable-next-line no-param-reassign
      label.style[positionProperty] = `${currentLabelIndent - labelSize / 2}px`;

      if (this.options.pips) {
        const pip = label.firstChild as HTMLDivElement;
        const pipSize = this.getPipCoords(pip)[sizeProperty];

        pip.style[positionProperty] = `${
          labelSize / 2 - pipSize / 2
        }px`;
      }

      currentLabelIndent += interval;
    });
    this.labelHtml = scale;
  }

  whenUserClicksOnLabel(callback: (middleCoordinate: number) => void): void {
    this.labelClickedSubject.addObserver((middleCoordinate: number) => {
      callback(middleCoordinate);
    });
  }

  getRootCoords(): Coords {
    return getCoords(this.root);
  }

  getLabelCoords(label: number | HTMLDivElement): Coords {
    if (typeof label === 'number') {
      return getCoords(this.sliderLabels[label - 1]);
    }
    return getCoords(label);
  }

  getPipCoords(label: number | HTMLDivElement): Coords {
    if (typeof label === 'number') {
      return getCoords(this.sliderLabels[label - 1].firstChild as HTMLElement);
    }
    return getCoords(label);
  }

  private createLabels(): void {
    const labels: HTMLDivElement[] = [];
    const { min, max, step } = this.options;

    for (let value = min; value <= max; value += step) {
      labels.push(this.getLabel());
    }

    this.sliderLabels = labels;
  }

  private getLabel(): HTMLDivElement {
    const label = document.createElement('div');

    label.setAttribute('class', 'jquery-slider__label');

    if (this.options.pips) {
      const pip = document.createElement('div');

      pip.setAttribute('class', 'jquery-slider__pip');
      label.append(pip);
    }
    return label;
  }

  private setClasses(): void {
    const { orientation, labels, pips } = this.options;
    const areNoLabelsOrPipsRequired = !labels && !pips;

    if (areNoLabelsOrPipsRequired) return;

    this.sliderLabels.forEach((label) => {
      label.setAttribute('class', 'jquery-slider__label');
      label.classList.add(`jquery-slider__label_orientation_${orientation}`);

      if (pips) {
        const pip = label.children[0];

        pip.setAttribute('class', 'jquery-slider__pip');
        pip.classList.add(`jquery-slider__pip_orientation_${orientation}`);
      }
    });
  }

  private setValue(): void {
    if (!this.options.labels) return;

    const { min, step, valueFunction } = this.options;

    for (
      let i = 0, value = min;
      i < this.sliderLabels.length;
      i += 1, value += step
    ) {
      const label = this.sliderLabels[i];

      if (valueFunction) {
        label.innerHTML += String(valueFunction(value));
      } else label.innerHTML += String(value);
    }
  }

  private setClickHandler(): void {
    this.sliderLabels.forEach((label, index) => {
      const clickHandler = (): void => {
        const labelCoords = this.getLabelCoords(index + 1);

        const middle = this.options.orientation === 'horizontal'
          ? labelCoords.left + labelCoords.width / 2
          : labelCoords.top + labelCoords.height / 2;

        this.labelClickedSubject.notifyObservers(middle);
      };

      label.addEventListener('click', clickHandler);
    });
  }

  private getRenderingOptions(): {
    sliderSize: number;
    sizeProperty: 'width' | 'height';
    positionProperty: 'left' | 'bottom';
    interval: number;
    labelsArray: HTMLDivElement[];
    } | null {
    const { orientation } = this.options;

    const sizeProperty = orientation === 'horizontal' ? 'width' : 'height';
    const positionProperty = orientation === 'horizontal' ? 'left' : 'bottom';

    const sliderSize = this.getRootCoords()[sizeProperty];

    let itemsOptimalInterval = this.getLabelsOptimalInterval();

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
      sizeProperty,
      positionProperty,
    };
  }

  private getMaxLabelCoords(): { maxLabelCoords: Coords; maxPipCoords: Coords } {
    const maxLabelNumber = this.labels.length - 1;
    const maxLabel = this.labels[maxLabelNumber - 1];
    const maxPip = this.options.pips ? maxLabel.children[0] as HTMLElement : null;

    this.root.append(maxLabel);

    const maxLabelCoords = this.getLabelCoords(maxLabelNumber);
    const maxPipCoords = maxPip && this.getPipCoords(maxLabelNumber);

    maxLabel.remove();

    return { maxLabelCoords, maxPipCoords };
  }

  private getLabelsOptimalInterval(): null | number {
    const { orientation } = this.options;
    const widthOrHeight = orientation === 'horizontal' ? 'width' : 'height';

    const { maxLabelCoords, maxPipCoords } = this.getMaxLabelCoords();

    const maxLabelSize = maxLabelCoords[widthOrHeight];
    const maxPipSize = maxPipCoords ? maxPipCoords[widthOrHeight] : null;
    const sliderSize = this.getRootCoords()[widthOrHeight];

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
