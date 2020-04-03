import { JQueryElementWithSlider } from '../../plugin/jquery-slider';
import SliderPresenter from '../../plugin/Slider/SliderPresenter';
import { Options, UserOptions } from '../../plugin/Slider/SliderModel';
import ConfigPanel, { PanelOptions } from '../config-panel/ConfigPanel';
import {
  ValueObject,
  ConfigItemValue,
  ConfigItemType,
} from '../config-item/ConfigItem';

export default class SliderPanel {
  private configPanel: ConfigPanel;

  private slider: SliderPresenter;

  constructor(private wrapper: HTMLDivElement) {
    this._defineElements();

    const sliderValueChangeHandler = (value: number | [number, number]) => {
      this.configPanel.setValue({ option: 'value', value });
    };

    this.slider.setOptions('change', sliderValueChangeHandler);

    this.configPanel.whenOptionValueChange(this._makeRefreshSliderCallback());
  }

  private _defineElements() {
    const panelWrapper = this.wrapper.querySelector('.js-config-panel');

    const $sliderWrapper = $(
      this.wrapper.querySelector('.js-slider'),
    ) as JQueryElementWithSlider;
    const options = $sliderWrapper.data('options');

    $sliderWrapper.slider(options);

    const { slider } = $sliderWrapper.data('slider');

    const sliderOptions = slider.getOptions() as Options;
    const panelOptions = this._getPanelOptions(sliderOptions);

    const panel = new ConfigPanel({
      root: panelWrapper as HTMLDivElement,
      options: panelOptions,
    });

    this.configPanel = panel;
    this.slider = slider;
  }

  private _makeRefreshSliderCallback() {
    return ({ option, value }: ValueObject): void => {
      const lastOptions = this.slider.getOptions() as Options;

      if (option === 'value') {
        const valueArray = typeof value === 'number' ? [value] : (value as number[]);

        let { range: newRange } = lastOptions;

        if (valueArray.length === 1 && lastOptions.range === true) {
          valueArray.push(lastOptions.max);
          newRange = true;

          this.configPanel.setValue({
            option,
            value: valueArray,
          });
        }

        if (valueArray.length === 2 && lastOptions.range !== true) {
          newRange = true;

          this.configPanel.setValue({
            option: 'range',
            value: 'true',
          });
        }

        try {
          this.slider.setOptions({
            value: valueArray.length === 1 ? valueArray[0] : valueArray,
            range: newRange,
          });
        } catch (error) {
          alert(error);

          this.configPanel.setValue({
            option,
            value: lastOptions.value,
          });

          this.configPanel.setValue({
            option: 'range',
            value: lastOptions.range,
          });
        }
      } else if (option === 'range') {
        let { value: newValue } = lastOptions;

        if (value === true && !Array.isArray(lastOptions.value)) {
          newValue = [lastOptions.value, lastOptions.max];

          this.configPanel.setValue({
            option: 'value',
            value: newValue,
          });
        }

        if (value !== true && Array.isArray(lastOptions.value)) {
          [newValue] = lastOptions.value;

          this.configPanel.setValue({
            option: 'value',
            value: newValue,
          });
        }

        try {
          this.slider.setOptions({
            value: newValue,
            [option]: value,
          } as UserOptions);
        } catch (error) {
          alert(error);

          this.configPanel.setValue({
            option: 'value',
            value: lastOptions.value,
          });

          this.configPanel.setValue({
            option,
            value: lastOptions[option],
          });
        }
      } else {
        try {
          console.log("i'm here", option, value, typeof value);
          this.slider.setOptions(option, value);
        } catch (error) {
          alert(error);

          this.configPanel.setValue({
            option,
            value: lastOptions[option] as ConfigItemValue<ConfigItemType>,
          });
        }
      }
    };
  }

  private _getPanelOptions(sliderOptions: Options): PanelOptions {
    const panelOptions = $.extend(true, {}, sliderOptions);
    delete panelOptions.change;
    delete panelOptions.classes;

    return panelOptions;
  }
}
