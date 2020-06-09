import { ValueFunction } from '../Model/modelOptions';

class TooltipView {
  private tooltipText: string | number | null = null;

  private tooltipHtml: HTMLDivElement;

  private orientation: 'horizontal' | 'vertical' | null = null;

  private root: HTMLElement | null = null;

  constructor() {
    this._create();
  }

  get html(): HTMLDivElement {
    return this.tooltipHtml;
  }

  get text(): string | number | null {
    return this.tooltipText;
  }

  get state(): { isRendered: boolean; isSet: boolean } {
    return {
      isRendered: !!this.root,
      isSet: !!(this.orientation && this.tooltipText),
    };
  }

  setOptions({ text, orientation, func }: {
    text: number;
    orientation: 'horizontal' | 'vertical';
    func?: ValueFunction;
  }): void {
    this.setText({ text, func });
    this.setOrientation(orientation);
  }

  render(root: HTMLElement): void {
    this.root = root;

    this.root.append(this.tooltipHtml);
  }

  setText({ text, func }: { text: number; func?: ValueFunction }): void {
    if (func) {
      this.tooltipText = func(text);
    } else this.tooltipText = text;

    this.tooltipHtml.innerHTML = String(this.tooltipText);
  }

  setOrientation(orientation: 'horizontal' | 'vertical'): void {
    this.orientation = orientation;

    this._setOrientationClass();
  }

  cleanTextField(): void {
    this.tooltipText = null;

    this.tooltipHtml.innerHTML = '';
  }

  remove(): void {
    this.root.removeChild(this.tooltipHtml);

    this.root = null;
  }

  destroy(): void {
    if (this.state.isRendered) this.remove();
    this.cleanTextField();
    this.orientation = null;
    this.root = null;

    this.tooltipHtml.className = 'jquery-slider-tooltip';
  }

  private _create(): void {
    const tooltip = document.createElement('div');
    tooltip.setAttribute('class', 'jquery-slider-tooltip');
    tooltip.style.position = 'absolute';

    const stopMousedownPropagationHandler = (clickEvent: MouseEvent): void => {
      clickEvent.stopPropagation();
    };

    tooltip.addEventListener('mousedown', stopMousedownPropagationHandler);

    this.tooltipHtml = tooltip;
  }

  private _setOrientationClass(): void {
    this.tooltipHtml.setAttribute('class', 'jquery-slider-tooltip');

    if (this.orientation === 'horizontal') {
      this.tooltipHtml.classList.add('jquery-slider-tooltip-horizontal');
    } else if (this.orientation === 'vertical') {
      this.tooltipHtml.classList.add('jquery-slider-tooltip-vertical');
    }
  }
}

export default TooltipView;
