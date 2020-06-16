import Observer from '../../plugin/Observer/Observer';
import { Options } from '../../plugin/Model/modelOptions';
import ConfigItem, {
  ConfigItemType,
  ConfigItemValue,
  ValueObject,
} from '../config-item/ConfigItem';

type PanelOptions = Omit<Options, 'change'>;

type Panel = {
  [key in keyof PanelOptions]: ConfigItem;
};

class ConfigPanel {
  private wrapper: HTMLDivElement;

  private panel: Panel;

  private optionValueChangedSubject = new Observer();

  constructor({ root, options }: {
    root: HTMLDivElement;
    options: PanelOptions;
  }) {
    this.wrapper = root;

    this._definePanel(options);
  }

  whenOptionValueChange(callback: (valueObjet: ValueObject) => void): void {
    this.optionValueChangedSubject.addObserver(
      (valueObject: ValueObject): void => {
        callback(valueObject);
      },
    );
  }

  setValue<T extends ConfigItemType>({
    option,
    value,
  }: {
    option: keyof PanelOptions;
    value: ConfigItemValue<T>;
  }): void {
    this.panel[option].setValue(value);
  }

  showError({ option, errorMessage, inputNumber }: {
    option: keyof PanelOptions;
    errorMessage: string;
    inputNumber?: 1 | 2;
  }): void {
    const item = this.panel[option];

    item.showError({ errorMessage, inputNumber });
  }

  private _definePanel(options: PanelOptions): void {
    const { wrapper } = this;

    const getItem = <T extends ConfigItemType>(
      type: T,
      optionName: keyof Panel,
      selectOptions?: string[],
    ): ConfigItem => {
      const itemWrapper = wrapper.querySelector(
        `[data-option='${optionName}']`,
      );
      const item = new ConfigItem({
        type,
        wrapper: itemWrapper as HTMLDivElement,
      });

      const optionValue = options[optionName] as ConfigItemValue<T>;

      const areSelectOptionsPassed = type === 'select' && selectOptions;

      if (areSelectOptionsPassed) {
        item.setSelectOptions(selectOptions);
      }

      item.setValue<T>(optionValue);

      const makeNotifyAboutChangedValueCallback = () => (
        valueObject: ValueObject,
      ): void => {
        this.optionValueChangedSubject.notifyObservers(valueObject);
      };

      item.whenValueChange(makeNotifyAboutChangedValueCallback());

      return item;
    };

    this.panel = {
      min: getItem('input', 'min'),
      max: getItem('input', 'max'),
      step: getItem('input', 'step'),
      value: getItem('range', 'value'),
      orientation: getItem('select', 'orientation', ['horizontal', 'vertical']),
      range: getItem('select', 'range', ['min', 'max', 'false', 'true']),
      tooltip: getItem('select', 'tooltip', ['true', 'false']),
      animate: getItem('select', 'animate', ['fast', 'slow', 'false']),
      labels: getItem('select', 'labels', ['true', 'false']),
      pips: getItem('select', 'pips', ['false', 'true']),
    };
  }
}

export default ConfigPanel;

export { PanelOptions };
