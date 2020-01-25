import { ValueFunction } from './Slider/SliderModel';
// TODO: add possibility to add custom classes
export default class SliderTooltipView {
  private _text: string | number | null = null;

  private _html: HTMLDivElement;

  private _orientation: 'horizontal' | 'vertical' | null = null;

  private _root: HTMLElement | null = null;

  constructor() {
    this._create();
  }

  get html(): HTMLDivElement {
    return this._html;
  }

  get text(): string | number | null {
    return this._text;
  }

  get state(): { isRendered: boolean; isSet: boolean } {
    return {
      isRendered: !!this._root,
      isSet: !!(this._orientation && this._text),
    };
  }

  setOptions(
    text: number,
    orientation: 'horizontal' | 'vertical',
    func?: ValueFunction,
  ): void {
    this.setText(text, func);
    this.setOrientation(orientation);
  }

  render(root: HTMLElement): void {
    this._root = root;

    this._root.append(this._html);
  }

  setText(text: number, func?: ValueFunction): void {
    if (func) {
      this._text = func(text);
    } else this._text = text;

    this._html.innerHTML = String(this._text);
  }

  setOrientation(orientation: 'horizontal' | 'vertical'): void {
    this._orientation = orientation;

    this._setOrientationClass();
  }

  cleanTextField(): void {
    this._text = null;

    this._html.innerHTML = '';
  }

  remove(): void {
    this._root.removeChild(this._html);

    this._root = null;
  }

  destroy(): void {
    if (this.state.isRendered) this.remove();
    this.cleanTextField();
    this._orientation = null;
    this._root = null;

    this._html.className = 'jquery-slider-tooltip';
  }

  private _create(): void {
    const tooltip = document.createElement('div');
    tooltip.setAttribute('class', 'jquery-slider-tooltip');
    tooltip.style.position = 'absolute';

    this._html = tooltip;
  }

  private _setOrientationClass(): void {
    this._html.setAttribute('class', 'jquery-slider-tooltip');

    if (this._orientation === 'horizontal') {
      this._html.classList.add('jquery-slider-tooltip-horizontal');
    } else if (this._orientation === 'vertical') {
      this._html.classList.add('jquery-slider-tooltip-vertical');
    }
  }
}
