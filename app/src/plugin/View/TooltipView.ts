import { ValueFunction } from '../Model/modelOptions';

class TooltipView {
  private tooltipValue: string | number;

  private tooltipHtml: HTMLDivElement;

  private orientation: 'horizontal' | 'vertical';

  private root: HTMLElement;

  constructor() {
    this._create();
  }

  get html(): HTMLDivElement {
    return this.tooltipHtml;
  }

  get value(): string | number | null {
    return this.tooltipValue;
  }

  get state(): { isRendered: boolean; isSet: boolean } {
    return {
      isRendered: !!this.root,
      isSet: !!(this.orientation && this.tooltipValue),
    };
  }

  setOptions({
    value, orientation, valueFunction, style,
  }: {
    value: number;
    orientation: 'horizontal' | 'vertical';
    valueFunction?: ValueFunction;
    style?: string;
  }): void {
    this.setValue({ value, valueFunction });
    this.setStyle({ orientation, style });
  }

  render(root: HTMLElement): void {
    this.root = root;
    this.root.append(this.tooltipHtml);
  }

  setValue({ value, valueFunction }: { value: number; valueFunction?: ValueFunction }): void {
    if (valueFunction) {
      this.tooltipValue = valueFunction(value);
    } else this.tooltipValue = value;

    this.tooltipHtml.innerHTML = String(this.tooltipValue);
  }

  setStyle({ orientation, style }: {
    orientation: 'horizontal' | 'vertical';
    style?: string;
  }): void {
    this.orientation = orientation;

    const main = `jquery-slider__tooltip jquery-slider__tooltip_orientation_${orientation}`;
    const custom = style ? `jquery-slider__tooltip_color_${style}` : '';
    this.tooltipHtml.className = `${main} ${custom}`;
  }

  cleanTextField(): void {
    this.tooltipValue = null;
    this.tooltipHtml.innerHTML = '';
  }

  remove(): void {
    this.root.removeChild(this.tooltipHtml);
    this.root = null;
  }

  private _create(): void {
    const tooltip = document.createElement('div');
    tooltip.setAttribute('class', 'jquery-slider__tooltip');

    const stopMousedownPropagation = (clickEvent: MouseEvent): void => {
      clickEvent.stopPropagation();
    };

    tooltip.addEventListener('mousedown', stopMousedownPropagation);

    this.tooltipHtml = tooltip;
  }
}

export default TooltipView;
