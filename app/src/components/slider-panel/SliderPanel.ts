import Presenter from '../../plugin/Presenter/Presenter';
import SliderElement from '../../plugin/main';
import { Options, UserOptions } from '../../plugin/Model/modelOptions';
import ConfigPanel, { PanelOptions } from '../config-panel/ConfigPanel';
import {
  ValueObject,
  ConfigItemValue,
  ConfigItemType,
} from '../config-item/ConfigItem';

interface NewOptions {
  newSliderOptions: UserOptions;
  newPanelOptions?: ValueObject[];
}

export default class SliderPanel {
  private configPanel: ConfigPanel;

  private slider: Presenter;

  constructor(private wrapper: HTMLDivElement) {
    this._defineElements();
    this.slider.setOptions({ change: this._handleSliderValueChange.bind(this) });
    this.configPanel.whenOptionValueChange(this._refreshSlider.bind(this));
  }

  private _defineElements(): void {
    const panelWrapper = this.wrapper.querySelector('.js-config-panel');

    const $sliderWrapper = $(
      this.wrapper.querySelector('.js-slider'),
    ) as SliderElement;
    const options = $sliderWrapper.data('options');

    $sliderWrapper.slider(options);

    const { slider } = $sliderWrapper.data('slider');

    const sliderOptions = slider.getOptions();
    const panelOptions = this._getPanelOptions(sliderOptions);

    const panel = new ConfigPanel({
      root: panelWrapper as HTMLDivElement,
      options: panelOptions,
    });

    this.configPanel = panel;
    this.slider = slider;
  }

  private _handleSliderValueChange(value: number | [number, number]): void {
    this.configPanel.setValue({ option: 'value', value });
  }

  private _refreshSlider({ option, value: panelValue }: ValueObject): void {
    const lastOptions = this.slider.getOptions();

    let newOptions: NewOptions;

    if (option === 'value') {
      newOptions = this._processNewValue(panelValue as UserOptions['value']);
    } else if (option === 'range') {
      newOptions = this._processNewRange(panelValue as UserOptions['range']);
    } else if (option === 'step') {
      newOptions = this._processNewStep(panelValue as Options['step']);
    } else if (option === 'min' || option === 'max') {
      newOptions = this._processNewMinMax({ option, minOrMax: panelValue as number });
    } else {
      newOptions = {
        newSliderOptions: {
          [option]: panelValue,
        },
      };
    }

    const { newSliderOptions, newPanelOptions } = newOptions;

    try {
      this.slider.setOptions(newSliderOptions);

      newPanelOptions.forEach((valueObject) => {
        this.configPanel.setValue(valueObject);
      });
    } catch (error) {
      this.configPanel.setValue({
        option,
        value: lastOptions[option] as ConfigItemValue<ConfigItemType>,
      });
    }
  }

  private _processNewValue(value: UserOptions['value']): NewOptions {
    const sliderOptions = this.slider.getOptions();
    const {
      value: lastValue,
      range: lastRange,
      min: lastMin,
      max: lastMax,
      step: lastStep,
    } = sliderOptions;

    const valueArray = !Array.isArray(value) ? [value] : value;
    const wasRangeTrue = lastRange === true;
    let { range: newRange } = sliderOptions;

    if (valueArray.length === 1) {
      let newFirstValue: number;

      if (wasRangeTrue) {
        valueArray.push(lastMax);
        newRange = true;

        newFirstValue = this._getCorrectedValue({
          value: valueArray[0],
          position: 'first',
          min: lastMin,
          max: lastMax,
          step: lastStep,
        });

        if (newFirstValue === lastMax) {
          newFirstValue -= lastStep;
        }

        if (value < lastMin) {
          this.configPanel.showError({
            option: 'value',
            errorMessage: 'First value cannot be less than min',
            inputNumber: 1,
          });
        } else if (value >= lastMax) {
          this.configPanel.showError({
            option: 'value',
            errorMessage: 'First value cannot be equal or more than max',
            inputNumber: 1,
          });
        }
      } else {
        newFirstValue = this._getCorrectedValue({
          value: valueArray[0],
          position: 'single',
          min: lastMin,
          max: lastMax,
          step: lastStep,
        });

        if (value < lastMin) {
          this.configPanel.showError({
            option: 'value',
            errorMessage: 'Value cannot be less than min',
            inputNumber: 1,
          });
        } else if (value > lastMax) {
          this.configPanel.showError({
            option: 'value',
            errorMessage: 'Value cannot be more than max',
            inputNumber: 1,
          });
        }
      }

      valueArray[0] = newFirstValue;
    } else if (valueArray.length === 2) {
      if (!wasRangeTrue) {
        newRange = true;
      }

      const isSecondChanged = !wasRangeTrue || lastValue[1] !== valueArray[1];
      const isFirstChanged = wasRangeTrue && lastValue[0] !== valueArray[0];

      let [correctFirstValue, correctSecondValue] = valueArray;

      const isSecondEqualsOrLessThanFirst = (
        first: number, second: number,
      ): boolean => (
        second < first || second === first
      );

      const [initialFirstValue, initialSecondValue] = value as number[];

      if (isSecondChanged) {
        correctSecondValue = this._getCorrectedValue({
          value: correctSecondValue,
          position: 'last',
          min: lastMin,
          max: lastMax,
          step: lastStep,
        });

        if (isSecondEqualsOrLessThanFirst(correctFirstValue, correctSecondValue)) {
          correctSecondValue = correctFirstValue + lastStep;

          this.configPanel.showError({
            option: 'value',
            errorMessage: 'Second value cannot be equal or less than first',
            inputNumber: 2,
          });
        } else if (initialSecondValue > lastMax) {
          this.configPanel.showError({
            option: 'value',
            errorMessage: 'Second value cannot be more than max',
            inputNumber: 2,
          });
        } else if (initialSecondValue <= lastMin) {
          this.configPanel.showError({
            option: 'value',
            errorMessage: 'Second value cannot be equal or less than min',
            inputNumber: 2,
          });
        }
      }

      if (isFirstChanged) {
        correctFirstValue = this._getCorrectedValue({
          value: correctFirstValue,
          position: 'first',
          min: lastMin,
          max: lastMax,
          step: lastStep,
        });

        if (isSecondEqualsOrLessThanFirst(correctFirstValue, correctSecondValue)) {
          correctFirstValue = correctSecondValue - lastStep;

          this.configPanel.showError({
            option: 'value',
            errorMessage: 'First value cannot be equal or more than second',
            inputNumber: 1,
          });
        } else if (initialFirstValue < lastMin) {
          this.configPanel.showError({
            option: 'value',
            errorMessage: 'First value cannot be less than min',
            inputNumber: 1,
          });
        } else if (initialFirstValue >= lastMax) {
          this.configPanel.showError({
            option: 'value',
            errorMessage: 'First value cannot be equal or more than max',
            inputNumber: 1,
          });
        }
      }
      valueArray[0] = correctFirstValue;
      valueArray[1] = correctSecondValue;
    }

    const correctValue = valueArray.length === 1 ? valueArray[0] : valueArray;

    return {
      newPanelOptions: [
        { option: 'range', value: 'true' },
        { option: 'value', value: correctValue },
      ],
      newSliderOptions: {
        value: correctValue,
        range: newRange,
      },
    };
  }

  private _processNewRange(range: UserOptions['range']): NewOptions {
    const sliderOptions = this.slider.getOptions();
    const {
      value: lastValue,
      max: lastMax,
    } = sliderOptions;

    let { value: newValue } = sliderOptions;

    const isRangeTruePassedWhenValueIsNotArray = range === true
      && !Array.isArray(lastValue);
    const isRangeNotTruePassedWhenValueIsArray = range !== true
      && Array.isArray(lastValue);

    if (isRangeTruePassedWhenValueIsNotArray) {
      newValue = [lastValue as number, lastMax];
    }

    if (isRangeNotTruePassedWhenValueIsArray) {
      [newValue] = lastValue as number[];
    }

    return {
      newPanelOptions: [
        { option: 'value', value: newValue },
      ],
      newSliderOptions: {
        value: newValue,
        range,
      },
    };
  }

  private _processNewStep(step: UserOptions['step']): NewOptions {
    const sliderOptions = this.slider.getOptions();
    const {
      value: lastValue,
      min: lastMin,
      max: lastMax,
    } = sliderOptions;

    let newStep = step;
    let newValue: UserOptions['value'];

    const lastDifference = lastMax - lastMin;
    const isNotAMultiple = lastDifference % newStep !== 0;

    newStep = newStep > 0 ? newStep : 1;

    if (isNotAMultiple) {
      const errorMessage = (
        `'${newStep}' - incorrect step, because it's not multiple of 'max' and 'min' difference`
      );

      this.configPanel.showError({
        option: 'step',
        errorMessage,
      });
    } else if (typeof lastValue === 'number') {
      newValue = this._getClosestCorrectValue({
        value: lastValue,
        step: newStep,
        min: lastMin,
      });
    } else if (Array.isArray(lastValue)) {
      let [correctFirstValue, correctSecondValue] = lastValue;

      correctFirstValue = this._getClosestCorrectValue({
        value: correctFirstValue,
        step: newStep,
        min: lastMin,
      });

      correctSecondValue = this._getClosestCorrectValue({
        value: correctSecondValue,
        step: newStep,
        min: lastMin,
      });

      if (correctFirstValue === correctSecondValue) {
        if (correctFirstValue === lastMin) {
          correctSecondValue = lastMin + newStep;
        } else if (correctSecondValue === lastMax) {
          correctFirstValue = lastMax - newStep;
        } else {
          correctSecondValue = correctFirstValue + newStep;
        }
      }
      newValue = [correctFirstValue, correctSecondValue];
    }

    return {
      newPanelOptions: [
        { option: 'max', value: lastMax },
        { option: 'value', value: newValue },
        { option: 'step', value: newStep },
      ],
      newSliderOptions: {
        max: lastMax,
        value: newValue,
        step: newStep,
      },
    };
  }

  private _processNewMinMax({ option, minOrMax }: {
    option: 'min' | 'max';
    minOrMax: number;
  }): NewOptions {
    const lastOptions = this.slider.getOptions();
    const {
      value: lastValue,
      min: lastMin,
      max: lastMax,
      step: lastStep,
    } = lastOptions;
    let {
      min: newMin,
      max: newMax,
      value: newValue,
      step: newStep,
    } = lastOptions;

    if (option === 'min') {
      newMin = minOrMax;

      if (newMin >= lastMax) {
        newMax = newMin + lastStep;
      }
    }

    if (option === 'max') {
      newMax = minOrMax;

      if (newMax <= lastMin) {
        newMin = newMax - lastStep;
      }
    }

    const lastDifference = lastMax - lastMin;
    const newDifference = newMax - newMin;

    const isMultiple = ({ difference, step }: {
        difference: number;
        step: number;
      }): boolean => (
      difference % step === 0
    );

    if (!isMultiple({ difference: newDifference, step: lastStep })) {
      while (
        !isMultiple({ difference: newDifference, step: newStep })
          || !isMultiple({ difference: lastDifference, step: newStep })
      ) {
        newStep -= 0.5;

        if (newStep === 0) {
          newStep = lastStep;
          break;
        }
      }

      const isAdviseNeeded = newStep !== lastStep;
      const advise = isAdviseNeeded ? `You can use step equals ${newStep}.` : '';

      const errorMessage = (
        `Step should be multiple to 'max - min'.${advise}`
      );

      this.configPanel.showError({
        option,
        errorMessage,
      });
      newMin = lastMin;
      newMax = lastMax;
    }

    if (typeof lastValue === 'number') {
      newValue = this._getCorrectedValue({
        value: lastValue,
        position: 'single',
        min: newMin,
        max: newMax,
        step: lastStep,
      });
    }

    if (Array.isArray(lastValue)) {
      const correctFirstValue = this._getCorrectedValue({
        value: lastValue[0],
        position: 'first',
        min: newMin,
        max: newMax,
        step: lastStep,
      });

      const correctSecondValue = this._getCorrectedValue({
        value: lastValue[1],
        position: 'last',
        min: newMin,
        max: newMax,
        step: lastStep,
      });

      newValue = [correctFirstValue, correctSecondValue];
    }

    return {
      newPanelOptions: [
        { option: 'max', value: newMax },
        { option: 'min', value: newMin },
        { option: 'value', value: newValue },
      ],
      newSliderOptions: {
        min: newMin,
        max: newMax,
        value: newValue,
      },
    };
  }

  private _getPanelOptions(sliderOptions: Options): PanelOptions {
    const panelOptions = { ...sliderOptions };
    delete panelOptions.change;

    return panelOptions;
  }

  private _getClosestCorrectValue({ value, step, min }: {
    value: number;
    step: number;
    min: number;
  }): number {
    const adjustedValue = value - min;

    const closestAdjustedValue = (
      adjustedValue % step !== 0
        ? Math.round(adjustedValue / step) * step
        : adjustedValue
    );

    return closestAdjustedValue + min;
  }

  private _getCorrectedValue({
    value,
    position,
    min,
    max,
    step,
  }: {
      value: number;
      position: 'first' | 'last' | 'single';
      min: number;
      max: number;
      step: number;
    }): number {
    let formattedValue: number;

    if (position === 'single') {
      const maybeMaxOrClosest = value > max
        ? max
        : this._getClosestCorrectValue({ value, step, min });

      formattedValue = value < min ? min : maybeMaxOrClosest;
    }

    if (position === 'first') {
      const maybeAlmostMaxOrClosest = value > max || value === max
        ? max - step
        : this._getClosestCorrectValue({ value, step, min });

      formattedValue = value < min ? min : maybeAlmostMaxOrClosest;
    }

    if (position === 'last') {
      const maybeMaxOrClosest = value > max
        ? max
        : this._getClosestCorrectValue({ value, step, min });

      formattedValue = value < min || value === min ? min + step : maybeMaxOrClosest;
    }
    return formattedValue;
  }
}
