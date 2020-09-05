import Observer from '../../../plugin/components/Observer/Observer';
import { Options } from '../../../plugin/components/Model/modelOptions';

type ConfigItemType = 'input' | 'select' | 'range';
type ConfigItemValue<T extends ConfigItemType> = T extends 'input'
  ? number
  : T extends 'select'
    ? string | boolean
    : number[] | number;

type PanelOptions = Omit<Options, 'change'>;

type Item = {
  wrapper: HTMLDivElement;
  sign: HTMLDivElement;
  errorTooltip: HTMLDivElement;
  input?: HTMLInputElement;
  select?: HTMLSelectElement;
  firstInput?: HTMLInputElement;
  secondInput?: HTMLInputElement;
};

type ValueObject = {
  option: keyof PanelOptions;
  value: ConfigItemValue<ConfigItemType>;
};

class ConfigItem {
  private item: Item;

  private type: ConfigItemType;

  private optionName: string;

  private valueChangedSubject = new Observer();

  constructor({ type, wrapper }: { type: ConfigItemType; wrapper: HTMLDivElement }) {
    this.type = type;
    this.optionName = wrapper.getAttribute('data-option');

    this.item = this.getItem(type, wrapper);
    this.addListener();
  }

  setSelectOptions(options: string[]): void {
    if (this.type === 'select') {
      const optionsFragment = document.createDocumentFragment();

      options.forEach((optionItem: string): void => {
        const optionElement = document.createElement('option');
        optionElement.setAttribute('class', 'select-option');

        optionElement.value = optionItem;
        optionElement.innerHTML = optionItem;

        optionsFragment.append(optionElement);
      });
      this.item.select.append(optionsFragment);
    }
  }

  setValue<T extends ConfigItemType>(value: ConfigItemValue<T>): void {
    const { type, item } = this;

    if (type === 'input') {
      const { input } = item;
      input.value = String(value);
    }
    if (type === 'select') {
      const { select } = item;
      select.value = String(value);
    }
    if (type === 'range') {
      const { firstInput, secondInput } = item;
      const [firstValue, secondValue] = !Array.isArray(value)
        ? [value, '']
        : value;

      firstInput.value = String(firstValue);
      secondInput.value = String(secondValue);
    }
  }

  showError({ errorMessage, inputNumber }: {
    errorMessage: string;
    inputNumber: 1 | 2;
  }): void {
    const { type, item, item: { errorTooltip } } = this;

    let dataField: (HTMLInputElement | HTMLSelectElement);
    let elementName: string;

    if (type === 'range') {
      const inputName = inputNumber === 1 ? 'firstInput' : 'secondInput';

      dataField = item[inputName];
      elementName = inputNumber === 1 ? 'first-input' : 'second-input';
    } else if (type === 'select') {
      dataField = item.select;
      elementName = 'select';
    } else if (type === 'input') {
      dataField = item.input;
      elementName = 'input';
    }

    errorTooltip.classList.add('config-item__error-tooltip_visible');
    errorTooltip.innerHTML = errorMessage;

    dataField.classList.add(`config-item__${elementName}_color_red`);

    const hideTooltipHandler = (clickEvent: MouseEvent): void => {
      if (clickEvent.target === errorTooltip) return;

      errorTooltip.classList.remove('config-item__error-tooltip_visible');

      dataField.classList.remove(`config-item__${elementName}_color_red`);

      document.removeEventListener('click', hideTooltipHandler);
      document.removeEventListener('keydown', hideTooltipHandler);
    };
    const addHideTooltipHandlerCallback = (): void => {
      document.addEventListener('click', hideTooltipHandler);
      document.addEventListener('keydown', hideTooltipHandler);
    };
    window.setTimeout(addHideTooltipHandlerCallback, 500);
  }

  whenValueChange(callback: (valueObject: ValueObject) => void): void {
    this.valueChangedSubject.addObserver((valueObject: ValueObject): void => {
      callback(valueObject);
    });
  }

  private getItem(
    type: ConfigItemType,
    wrapper: HTMLDivElement,
  ): Item {
    const children = (wrapper.children as unknown) as HTMLElement[];

    if (type === 'input') {
      const [sign, input, errorTooltip] = children as [
        HTMLDivElement,
        HTMLInputElement,
        HTMLDivElement,
      ];

      return {
        wrapper, sign, input, errorTooltip,
      };
    }

    if (type === 'select') {
      const [sign, select, errorTooltip] = children as [
        HTMLDivElement,
        HTMLSelectElement,
        HTMLDivElement,
      ];

      return {
        wrapper, sign, select, errorTooltip,
      };
    }

    if (type === 'range') {
      const [sign, firstInput, secondInput, errorTooltip] = children as [
        HTMLDivElement,
        HTMLInputElement,
        HTMLInputElement,
        HTMLDivElement
      ];

      return {
        wrapper,
        sign,
        firstInput,
        secondInput,
        errorTooltip,
      };
    }

    return undefined;
  }

  private addListener(): void {
    const { type } = this;
    const isInputOrSelect = type === 'input' || type === 'select';

    const notify = <T extends ConfigItemType>(value: ConfigItemValue<T>): void => {
      this.valueChangedSubject.notifyObservers({
        option: this.optionName,
        value,
      });
    };

    if (isInputOrSelect) {
      const element = type === 'input'
        ? this.item.input
        : this.item.select;

      const valueChangeListener = (event: Event): void => {
        const value = (event.target as
          | HTMLInputElement
          | HTMLSelectElement).value.trim();

        const maybeFalse = value === 'false' ? false : value;
        const maybeBoolean = value.trim() === 'true' ? true : maybeFalse;

        const preparedValue = type === 'input' ? Number(value) : maybeBoolean;

        const isValueNotCorrectForInput = type === 'input'
          && typeof preparedValue !== 'number';

        if (isValueNotCorrectForInput) {
          throw new Error(`${this.optionName} should be number`);
        }

        notify(preparedValue);
      };

      element.addEventListener('change', valueChangeListener);
    } else {
      const rangeValueChangeHandler = (): void => {
        const { firstInput, secondInput } = this.item;
        const firstValue = firstInput.value.trim();
        const secondValue = secondInput.value.trim();

        const iSFirstNumber = typeof Number(firstValue) === 'number';
        const isSecondNumberOrEmpty = secondValue === ''
          || typeof Number(secondValue) === 'number';

        if (!iSFirstNumber || !isSecondNumberOrEmpty) {
          throw new Error('value should be number');
        }

        const isSecondValueEmpty = secondValue === '';
        const value = isSecondValueEmpty
          ? Number(firstValue)
          : [Number(firstValue), Number(secondValue)];

        notify(value);
      };

      const { firstInput, secondInput } = this.item;

      firstInput.addEventListener('change', rangeValueChangeHandler);
      secondInput.addEventListener('change', rangeValueChangeHandler);
    }
  }
}

export {
  ConfigItemType,
  ConfigItemValue,
  ValueObject,
};

export default ConfigItem;
