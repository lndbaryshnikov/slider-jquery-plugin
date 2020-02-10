import SliderPresenter from '../Slider/SliderPresenter';
import { Options, UserOptions } from '../Slider/SliderModel';

type Item = {
  wrapper: HTMLDivElement;
  sign: HTMLDivElement;
};

type InputItem = Item & { input: HTMLInputElement };
type SelectItem = Item & { select: HTMLSelectElement };

type ValueItem = Item & {
  firstInput: HTMLInputElement;
  secondInput: HTMLInputElement;
}

interface ConfigPanel {
  wrapper: HTMLDivElement;
  min: InputItem;
  max: InputItem;
  step: InputItem;
  value: ValueItem;
  orientation: SelectItem;
  range: SelectItem;
  tooltip: SelectItem;
  animate: SelectItem;
  labels: SelectItem;
  pips: SelectItem;
}

export default class SliderDemo {
  private _configPanel: ConfigPanel;

  private _wrapper: HTMLDivElement;

  constructor(private _slider: SliderPresenter, options: UserOptions, private _root: HTMLElement) {
    this._wrapper = document.createElement('div');
    this._wrapper.setAttribute('class', 'slider-demo');

    this._slider.setOptions(options);

    this._createPanel();

    this._slider.setOptions('change', (value: number | number[]) => {
      const { firstInput } = this._configPanel.value;
      const { secondInput } = this._configPanel.value;

      if (Array.isArray(value)) {
        firstInput.value = String(value[0]);
        secondInput.value = String(value[1]);
      } else {
        firstInput.value = String(value);
      }
    });

    this._addHandlers();
  }

  render(): void {
    this._root.append(this._wrapper);

    const sliderWrapper = document.createElement('div');
    sliderWrapper.setAttribute('class', 'slider-demo__slider');

    this._wrapper.append(sliderWrapper);
    this._slider.render(sliderWrapper);

    this._wrapper.append(this._configPanel.wrapper);
  }

  private _createPanel(): void {
    const panelBlockClass = 'config-panel';
    const itemBlockClass = 'config-item';

    const getPanelBlockDiv = (className?: string): HTMLDivElement => {
      const div = document.createElement('div');

      if (!className) {
        div.setAttribute('class', `${panelBlockClass}`);
      } else {
        div.setAttribute('class', `${panelBlockClass}__${className}`);
      }
      return div;
    };

    const getItemElement = (elem: string, className: string): HTMLElement => {
      const element = document.createElement(elem);
      element.setAttribute('class', `${itemBlockClass}__${className}`);

      return element;
    };

    const sliderSettings = this._slider.getOptions() as Options;

    const getItem = <T extends 'input' | 'select' | 'value'>(
      type: T,
      text: string,
      sliderOption: keyof Options,
      selectValues?: string[],
    ): T extends 'input' ? InputItem : T extends 'select' ? SelectItem : ValueItem => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('class', 'config-item');

      const sign = getItemElement('div', 'sign') as HTMLDivElement;

      sign.innerHTML = text;

      wrapper.append(sign);

      if (type === 'value') {
        const firstInput = getItemElement('input', 'first-input') as HTMLInputElement;
        const secondInput = getItemElement('input', 'second-input') as HTMLInputElement;

        wrapper.append(firstInput);
        wrapper.append(secondInput);

        const { value } = sliderSettings;

        firstInput.value = String(Array.isArray(value) ? value[0] : value);
        secondInput.value = Array.isArray(value) ? String(value[1]) : '';

        return {
          wrapper,
          sign,
          firstInput,
          secondInput,
        } as any;
      }

      const element = getItemElement(type, type) as HTMLSelectElement | HTMLInputElement;

      wrapper.append(element);

      if (type === 'select') {
        selectValues.forEach((value) => {
          const option = getItemElement('option', 'select-option') as HTMLOptionElement;

          option.value = value;
          option.innerHTML = value;

          element.append(option);
        });

        (element as HTMLSelectElement).value = String(sliderSettings[sliderOption]);

        return {
          wrapper,
          sign,
          select: element as HTMLSelectElement,
        } as any;
      }

      if (type === 'input') {
        (element as HTMLInputElement).placeholder = 'type value...';
        (element as HTMLInputElement).value = String(sliderSettings[sliderOption]);

        return {
          wrapper,
          sign,
          input: element as HTMLInputElement,
        } as any;
      }
    };

    this._configPanel = {
      wrapper: getPanelBlockDiv(),
      min: getItem('input', 'Min:', 'min'),
      max: getItem('input', 'Max:', 'max'),
      step: getItem('input', 'Step:', 'step'),
      value: getItem('value', 'Value:', 'value'),
      orientation: getItem(
        'select', 'Orientation:',
        'orientation', ['horizontal', 'vertical'],
      ),
      range: getItem(
        'select', 'Range:', 'range',
        ['min', 'max', 'false', 'true'],
      ),
      tooltip: getItem(
        'select', 'Tooltip:',
        'tooltip', ['true', 'false'],
      ),
      animate: getItem(
        'select', 'Animate:',
        'animate', ['fast', 'slow', 'false'],
      ),
      labels: getItem(
        'select', 'Labels:',
        'labels', ['true', 'false'],
      ),
      pips: getItem(
        'select', 'Pips:',
        'pips', ['false', 'true'],
      ),
    };

    const items = Object.values(this._configPanel)
      .slice(1)
      .map((item: SelectItem | ValueItem | InputItem) => item.wrapper);

    this._configPanel.wrapper.append(...items);
  }

  private _refreshSlider(
    option: keyof Options | UserOptions,
    value?: string | number | boolean | number[],
  ): void {
    if (typeof option === 'object') {
      this._slider.setOptions(option);
      return;
    }

    this._slider.setOptions(option, value);
  }

  private _addHandlers(): void {
    const elements = this._configPanel;

    Object.keys(elements).forEach((option: keyof ConfigPanel) => {
      if (Object.prototype.hasOwnProperty.call(elements, option)
        && option !== 'wrapper') {
        const optionCopy = option;

        if (optionCopy === 'min' || optionCopy === 'max' || optionCopy === 'step' || optionCopy === 'value') {
          if (optionCopy !== 'value') {
            const { input } = elements[optionCopy];

            input.addEventListener('change', () => {
              this._checkAndTrimPanel();

              const inputValue = Number(input.value);
              const lastSliderSettings = this._slider.getOptions() as Options;
              const lastSliderValue = lastSliderSettings[optionCopy];

              try {
                this._refreshSlider(optionCopy as keyof Options, inputValue);
              } catch (e) {
                alert(e);

                input.value = String(lastSliderValue);
              }
            });
          } else {
            const valueObject = elements[optionCopy];

            const valueHandler = (): void => {
              this._checkAndTrimPanel();

              const firstInputValue = Number(valueObject.firstInput.value);

              const secondInputValue = typeof Number(valueObject.secondInput.value) === 'number'
                ? Number(valueObject.secondInput.value) : null;

              const lastOptions = this._slider.getOptions() as Options;

              const value = !secondInputValue ? [firstInputValue]
                : [firstInputValue, secondInputValue];
              let { range } = lastOptions;

              if (value.length === 1 && lastOptions.range === true) {
                value.push(lastOptions.max);
                range = true;

                this._configPanel.value.secondInput.value = String(lastOptions.max);
              }

              if (value.length === 2 && lastOptions.range !== true) {
                range = true;

                this._configPanel.range.select.value = 'true';
              }

              try {
                this._refreshSlider({
                  value: value.length === 1 ? value[0] : value,
                  range,
                });
              } catch (e) {
                alert(e);
                if (Array.isArray(lastOptions.value)) {
                  valueObject.firstInput.value = String(lastOptions.value[0]);
                  valueObject.secondInput.value = String(lastOptions.value[1]);
                } else {
                  valueObject.firstInput.value = String(lastOptions.value);
                  valueObject.secondInput.value = '';
                }

                this._configPanel.range.select.value = String(lastOptions.range);
              }
            };

            valueObject.firstInput.addEventListener('change', valueHandler);
            valueObject.secondInput.addEventListener('change', valueHandler);
          }
        } else {
          const { select } = elements[optionCopy];

          select.addEventListener('change', () => {
            const ifFalse = select.value === 'false' ? false : select.value;

            const selectValue = select.value === 'true'
              ? true : ifFalse;

            const lastOptions = this._slider.getOptions() as Options;

            let { value } = lastOptions;

            if (optionCopy === 'range') {
              if (selectValue === true && !Array.isArray(lastOptions.value)) {
                value = [lastOptions.value, lastOptions.max];

                this._configPanel.value.secondInput.value = String(lastOptions.max);
              }

              if (selectValue !== true && Array.isArray(lastOptions.value)) {
                [value] = lastOptions.value;

                this._configPanel.value.secondInput.value = '';
              }
            }

            try {
              this._refreshSlider({
                value,
                [optionCopy]: selectValue,
              } as UserOptions);
            } catch (e) {
              alert(e);

              this._configPanel.value.secondInput.value = String(
                (lastOptions.value as number[])[1]
                  ? (lastOptions.value as number[])[1] : '',
              );

              select.value = String(lastOptions[optionCopy]);
            }
          });
        }
      }
    });
  }

  private _checkAndTrimPanel(): true | void {
    const inputObjectsNames: (keyof ConfigPanel)[] = ['min', 'max', 'step', 'value'];

    inputObjectsNames.forEach((objectName) => {
      if (objectName === 'value') {
        const valueObject = this._configPanel[objectName];

        const firstValueTrimmed = valueObject.firstInput.value.trim();
        const secondValueTrimmed = valueObject.secondInput.value.trim();

        const firstIsNumber = typeof Number(firstValueTrimmed) === 'number';
        const isSecondNumberOrEmpty = firstValueTrimmed === ''
                          || typeof Number(firstValueTrimmed) === 'number';

        if (!firstIsNumber || !isSecondNumberOrEmpty) {
          throw new Error('value should be number');
        }

        valueObject.firstInput.value = firstValueTrimmed;
        valueObject.secondInput.value = secondValueTrimmed;
      } else {
        const valueTrimmed = (this._configPanel[objectName] as InputItem).input.value.trim();

        if (typeof Number(valueTrimmed) !== 'number') {
          throw new Error(`${objectName} should be number`);
        }
      }
    });

    return true;
  }
}
