import getCoords from '../../common/getCoords';
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

export default class SliderLabelsView {
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

    let rootSnapshot: HTMLElement;

    if (this.state.isRendered) {
      rootSnapshot = this.root;
      this.destroy();
    }

    this.options = options;

    this._createLabels();
    this._setClasses();
    if (this.options.labels) this._setText();
    this._setClickHandler();

    if (rootSnapshot) {
      this.render(rootSnapshot);
    }
  }

  render(root: HTMLElement): void {
    this.root = root;

    const { orientation } = this.options;
    const scaleProperty = orientation === 'horizontal' ? 'width' : 'height';
    const labelProperty = orientation === 'horizontal' ? 'left' : 'bottom';

    const sliderPropertyValue = getCoords(root)[scaleProperty];

    const scale = document.createElement('div');
    scale.setAttribute('class',
      `jquery-slider-labels-scale jquery-slider-labels-scale-${orientation}`);
    scale.style.position = 'absolute';
    scale.style[scaleProperty] = `${sliderPropertyValue}px`;

    const interval = this._getInterval(sliderPropertyValue);

    let currentSize = 0;

    this.root.append(scale);

    this.sliderLabels.forEach((label) => {
      scale.append(label);

      const labelPropertyValue = getCoords(label)[scaleProperty];
      // eslint-disable-next-line no-param-reassign
      label.style[labelProperty] = `${currentSize - labelPropertyValue / 2}px`;

      if (this.options.pips) {
        const pip = label.children[0] as HTMLElement;
        const pipPropertyValue = getCoords(pip)[scaleProperty];

        pip.style[labelProperty] = `${labelPropertyValue / 2 - pipPropertyValue / 2}px`;
      }

      currentSize += interval;
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
    this.labelClickedSubject.addObserver((_middleCoordinate: number) => {
      callback(_middleCoordinate);
    });
  }

  private _createLabels(): void {
    const labels: HTMLDivElement[] = [];

    for (let value = this.options.min; value <= this.options.max; value += this.options.step) {
      labels.push(this._getLabel());
    }

    this.sliderLabels = labels;
  }

  private _getLabel(): HTMLDivElement {
    const label = document.createElement('div');
    const pip = document.createElement('div');

    label.setAttribute('class', 'jquery-slider-label');
    pip.setAttribute('class', 'jquery-slider-pip');

    label.style.position = 'absolute';
    pip.style.position = 'absolute';

    if (this.options.pips) label.append(pip);

    return label;
  }

  private _setClasses(): void {
    const { orientation } = this.options;

    if (!(this.options.labels) && !(this.options.pips)) return;

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

    const func = this.options.valueFunc;

    for (
      let i = 0, value = this.options.min;
      i < this.sliderLabels.length;
      i += 1, value += this.options.step
    ) {
      const label = this.sliderLabels[i];

      if (func) {
        label.innerHTML += String(func(value));
      } else label.innerHTML += String(value);
    }
  }

  private _getInterval(scaleSize: number): number {
    const range = this.options.max - this.options.min;
    const amount = range / this.options.step;

    return scaleSize / amount;
  }

  private _setClickHandler(): void {
    this.sliderLabels.forEach((label) => {
      label.addEventListener('click', () => {
        const labelCoords = getCoords(label);

        const middle = this.options.orientation === 'horizontal'
          ? labelCoords.left + labelCoords.width / 2
          : labelCoords.top + labelCoords.height / 2;

        this.labelClickedSubject.notifyObservers(middle);
      });
    });
  }
}

export {
  LabelOptions,
};
