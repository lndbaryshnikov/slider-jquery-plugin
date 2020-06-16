import { ValueFunction } from '../Model/modelOptions';

class TooltipView {
  private tooltipValue: string | number | null = null;

  private tooltipHtml: HTMLDivElement;

  private orientation: 'horizontal' | 'vertical' | null = null;

  private root: HTMLElement | null = null;

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
    value, orientation, valueFunction, className,
  }: {
    value: number;
    orientation: 'horizontal' | 'vertical';
    valueFunction?: ValueFunction;
    className?: string;
  }): void {
    this.setValue({ value, valueFunction });
    this.setClasses({ orientation, customClass: className });
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

  setClasses({ orientation, customClass }: {
    orientation: 'horizontal' | 'vertical';
    customClass?: string;
  }): void {
    this.orientation = orientation;

    const main = `jquery-slider-tooltip jquery-slider-tooltip_orientation_${orientation}`;
    const custom = customClass ? `${customClass}${orientation}` : '';
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

    const stopMousedownPropagationHandler = (clickEvent: MouseEvent): void => {
      clickEvent.stopPropagation();
    };

    tooltip.addEventListener('mousedown', stopMousedownPropagationHandler);

    this.tooltipHtml = tooltip;
  }
}

export default TooltipView;
