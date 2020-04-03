import { PanelOptions } from '../config-panel/ConfigPanel';
import Observer from '../../plugin/Observer/Observer';

type ConfigItemType = 'input' | 'select' | 'range';
type ConfigItemValue<T extends ConfigItemType> = T extends 'input'
  ? number : T extends 'select' ? string | boolean : number[] | number;

type Item = {
  wrapper: HTMLDivElement;
  sign: HTMLDivElement;
};

type InputItem = Item & { input: HTMLInputElement };
type SelectItem = Item & { select: HTMLSelectElement };

type RangeItem = Item & {
  firstInput: HTMLInputElement;
  secondInput: HTMLInputElement;
}

type ValueObject = {
  option: keyof PanelOptions;
  value: ConfigItemValue<ConfigItemType>;
};

class ConfigItem {
  private item: InputItem | SelectItem | RangeItem;

  private type: ConfigItemType;

  private optionName: keyof PanelOptions;

  private valueChangedSubject = new Observer();

  constructor(type: ConfigItemType, wrapper: HTMLDivElement) {
    this.type = type;
    this.optionName = wrapper.getAttribute('data-option') as keyof PanelOptions;

    this.item = this._getItem(type, wrapper);
    this._addListener();
  }

  setSelectOptions(options: string[]): void {
    if (this.type === 'select') {
      const fragment = document.createDocumentFragment();

      options.forEach((item: string): void => {
        const optionElement = document.createElement('option');
        optionElement.setAttribute('class', 'select-option');

        optionElement.value = item;
        optionElement.innerHTML = item;

        fragment.append(optionElement);
      });

      (this.item as SelectItem).select.append(fragment);
    }
  }

  setValue<T extends ConfigItemType>(
    value: ConfigItemValue<T>,
  ): void {
    const { type, item } = this;

    if (type === 'input') {
      const { input } = item as InputItem;

      input.value = String(value as number);
    }

    if (type === 'select') {
      const { select } = item as SelectItem;

      select.value = String(value);
    }

    if (type === 'range') {
      const { firstInput, secondInput } = item as RangeItem;
      const isValueSingle = typeof value === 'number';
      const [firstValue, secondValue] = isValueSingle ? [value, ''] : value as number[];

      firstInput.value = String(firstValue);
      secondInput.value = String(secondValue);
    }
  }

  whenValueChange(callback: (valueObject: ValueObject) => void): void {
    this.valueChangedSubject.addObserver((valueObject: ValueObject): void => {
      callback(valueObject);
    });
  }

  private _getItem <T extends ConfigItemType>(
    type: T,
    wrapper: HTMLDivElement,
  ): T extends 'input' ? InputItem : T extends 'select' ? SelectItem : RangeItem {
    const { children } = wrapper;

    if (type === 'input') {
      const [sign, input] = (children as unknown) as [HTMLDivElement, HTMLInputElement];

      return { wrapper, sign, input } as any;
    }

    if (type === 'select') {
      const [sign, select] = (children as unknown) as [HTMLDivElement, HTMLSelectElement];

      return { wrapper, sign, select } as any;
    }

    if (type === 'range') {
      const [
        sign,
        firstInput,
        secondInput,
      ] = (children as unknown) as [HTMLDivElement, HTMLInputElement, HTMLInputElement];

      return {
        wrapper,
        sign,
        firstInput,
        secondInput,
      } as any;
    }
  }

  private _addListener() {
    const { type } = this;
    const isInputOrSelect = type === 'input' || type === 'select';

    const notify = <T extends ConfigItemType>(value: ConfigItemValue<T>) => {
      console.log(value, typeof value);
      this.valueChangedSubject.notifyObservers({
        option: this.optionName,
        value,
      });
    };

    if (isInputOrSelect) {
      const element = type === 'input'
        ? (this.item as InputItem).input
        : (this.item as SelectItem).select;

      element.addEventListener('change', (event) => {
        const value = (event.target as HTMLInputElement | HTMLSelectElement).value.trim();

        const maybeFalse = value === 'false' ? false : value;
        const maybeBoolean = value.trim() === 'true' ? true : maybeFalse;

        const preparedValue = type === 'input' ? Number(value) : maybeBoolean;

        console.log(preparedValue, typeof preparedValue);

        const valueNotCorrectForInput = type === 'input' && typeof preparedValue !== 'number';

        if (valueNotCorrectForInput) {
          throw new Error(`${this.optionName} should be number`);
        }

        console.log(typeof value);
        notify(preparedValue);
      });
    } else {
      const rangeValueChangeHandler = () => {
        const { firstInput, secondInput } = this.item as RangeItem;
        const firstValue = firstInput.value.trim();
        const secondValue = secondInput.value.trim();

        const firstIsNumber = typeof Number(firstValue) === 'number';
        const isSecondNumberOrEmpty = secondValue === ''
          || typeof Number(secondValue) === 'number';

        if (!firstIsNumber || !isSecondNumberOrEmpty) {
          throw new Error('value should be number');
        }

        const isSecondValueEmpty = secondValue === '';
        const value = isSecondValueEmpty ? Number(firstValue)
          : [Number(firstValue), Number(secondValue)] as [number, number];

        notify(value);
      };

      const { firstInput, secondInput } = this.item as RangeItem;

      firstInput.addEventListener('change', rangeValueChangeHandler);
      secondInput.addEventListener('change', rangeValueChangeHandler);
    }
  }
}

export {
  ConfigItemType,
  ConfigItemValue,
  InputItem,
  SelectItem,
  RangeItem,
  ValueObject,
};

export default ConfigItem;
