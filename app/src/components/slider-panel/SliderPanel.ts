import ConfigPanel, { PanelOptions } from '../config-panel/ConfigPanel';
import {
  ValueObject,
  ConfigItemValue,
  ConfigItemType,
} from '../config-item/ConfigItem';
import Presenter from '../../plugin/Presenter/Presenter';
import SliderElement from '../../plugin/main';
import { Options, UserOptions } from '../../plugin/Model/modelOptions';

export default class SliderPanel {
  private configPanel: ConfigPanel;

  private slider: Presenter;

  constructor(private wrapper: HTMLDivElement) {
    this._defineElements();

    const sliderValueChangeHandler = (value: number | [number, number]): void => {
      this.configPanel.setValue({ option: 'value', value });
    };

    this.slider.setOptions({ change: sliderValueChangeHandler });

    this.configPanel.whenOptionValueChange(this._makeRefreshSliderCallback());
  }

  private _defineElements(): void {
    const panelWrapper = this.wrapper.querySelector('.js-config-panel');

    const $sliderWrapper = $(
      this.wrapper.querySelector('.js-slider'),
    ) as SliderElement;
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
    return ({ option, value: panelValue }: ValueObject): void => {
      const lastOptions = this.slider.getOptions() as Options;
      const {
        value: lastValue,
        range: lastRange,
        min: lastMin,
        max: lastMax,
        step: lastStep,
      } = lastOptions;

      const newSliderOptions: UserOptions = {};
      const newPanelOptions: ValueObject[] = [];

      const getClosestCorrectValue = ({ value, step, min }: {
        value: number;
        step: number;
        min: number;
      }): number => {
        const adjustedValue = value - min;

        const closestAdjustedValue = (
          adjustedValue % step !== 0
            ? Math.round(adjustedValue / step) * step
            : adjustedValue
        );

        return closestAdjustedValue + min;
      };

      const getCorrectedValue = ({
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
      }): number => {
        let formattedValue: number;

        if (position === 'single') {
          const maybeMaxOrClosest = value > max
            ? max
            : getClosestCorrectValue({ value, step, min });

          formattedValue = value < min ? min : maybeMaxOrClosest;
        }

        if (position === 'first') {
          const maybeAlmostMaxOrClosest = value > max || value === max
            ? max - step
            : getClosestCorrectValue({ value, step, min });

          formattedValue = value < min ? min : maybeAlmostMaxOrClosest;
        }

        if (position === 'last') {
          const maybeMaxOrClosest = value > max
            ? max
            : getClosestCorrectValue({ value, step, min });

          formattedValue = value < min || value === min ? min + step : maybeMaxOrClosest;
        }

        return formattedValue;
      };


      if (option === 'value') {
        let { range: newRange } = lastOptions;

        const valueArray = typeof panelValue === 'number'
          ? [panelValue]
          : (panelValue as number[]);

        const isOneValuePassed = (array: number[]): boolean => array.length === 1;
        const areTwoValuePassed = (array: number[]): boolean => array.length === 2;

        const wasRangeTrue = lastRange === true;

        if (isOneValuePassed(valueArray)) {
          let newFirstValue: number;

          const initialValue = panelValue as number;

          if (wasRangeTrue) {
            valueArray.push(lastOptions.max);
            newRange = true;

            newFirstValue = getCorrectedValue({
              value: valueArray[0],
              position: 'first',
              min: lastMin,
              max: lastMax,
              step: lastStep,
            });

            if (newFirstValue === lastMax) {
              newFirstValue -= lastStep;
            }

            if (initialValue < lastMin) {
              this.configPanel.showError({
                option: 'value',
                errorMessage: 'First value cannot be less than min',
                inputNumber: 1,
              });
            } else if (initialValue >= lastMax) {
              this.configPanel.showError({
                option: 'value',
                errorMessage: 'First value cannot be equal or more than max',
                inputNumber: 1,
              });
            }
          } else {
            newFirstValue = getCorrectedValue({
              value: valueArray[0],
              position: 'single',
              min: lastMin,
              max: lastMax,
              step: lastStep,
            });

            if (initialValue < lastMin) {
              this.configPanel.showError({
                option: 'value',
                errorMessage: 'Value cannot be less than min',
                inputNumber: 1,
              });
            } else if (initialValue > lastMax) {
              this.configPanel.showError({
                option: 'value',
                errorMessage: 'Value cannot be more than max',
                inputNumber: 1,
              });
            }
          }

          valueArray[0] = newFirstValue;
        } else if (areTwoValuePassed(valueArray)) {
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

          const [initialFirstValue, initialSecondValue] = panelValue as number[];

          if (isSecondChanged) {
            correctSecondValue = getCorrectedValue({
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
            correctFirstValue = getCorrectedValue({
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

        newPanelOptions.push(
          {
            option: 'range',
            value: 'true',
          },
          {
            option: 'value',
            value: isOneValuePassed(valueArray) ? valueArray[0] : valueArray,
          },
        );

        Object.assign(newSliderOptions, {
          value: isOneValuePassed(valueArray) ? valueArray[0] : valueArray,
          range: newRange,
        });
      } else if (option === 'range') {
        let { value: newValue } = lastOptions;

        const isRangeTruePassedWhenValueIsNotArray = panelValue === true
          && !Array.isArray(lastValue);

        if (isRangeTruePassedWhenValueIsNotArray) {
          newValue = [lastValue as number, lastOptions.max];
        }

        const isRangeNotTruePassedWhenValueIsArray = panelValue !== true
          && Array.isArray(lastValue);

        if (isRangeNotTruePassedWhenValueIsArray) {
          [newValue] = lastValue as number[];
        }

        newPanelOptions.push(
          {
            option: 'value',
            value: newValue,
          },
        );

        Object.assign(newSliderOptions, {
          value: newValue,
          range: panelValue,
        });
      } else if (option === 'step') {
        let newStep = panelValue as number;
        let newValue: number | [number, number];

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
          newValue = getClosestCorrectValue({
            value: lastValue,
            step: newStep,
            min: lastMin,
          });
        } else if (Array.isArray(lastValue)) {
          let [correctFirstValue, correctSecondValue] = lastValue;

          correctFirstValue = getClosestCorrectValue({
            value: correctFirstValue,
            step: newStep,
            min: lastMin,
          });

          correctSecondValue = getClosestCorrectValue({
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

        newPanelOptions.push(
          {
            option: 'max',
            value: lastMax,
          },
          {
            option: 'value',
            value: newValue,
          },
          {
            option: 'step',
            value: newStep,
          },
        );

        Object.assign(newSliderOptions, {
          max: lastMax,
          value: newValue,
          step: newStep,
        });
      } else if (option === 'min' || option === 'max') {
        let {
          min: newMin,
          max: newMax,
          value: newValue,
          step: newStep,
        } = lastOptions;

        if (option === 'min') {
          newMin = panelValue as number;

          if (newMin >= lastMax) {
            newMax = newMin + lastStep;
          }
        }

        if (option === 'max') {
          newMax = panelValue as number;

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
          newValue = getCorrectedValue({
            value: lastValue,
            position: 'single',
            min: newMin,
            max: newMax,
            step: lastStep,
          });
        }

        if (Array.isArray(lastValue)) {
          const correctFirstValue = getCorrectedValue({
            value: lastValue[0],
            position: 'first',
            min: newMin,
            max: newMax,
            step: lastStep,
          });

          const correctSecondValue = getCorrectedValue({
            value: lastValue[1],
            position: 'last',
            min: newMin,
            max: newMax,
            step: lastStep,
          });

          newValue = [correctFirstValue, correctSecondValue];
        }

        newPanelOptions.push(
          {
            option: 'max',
            value: newMax,
          },
          {
            option: 'min',
            value: newMin,
          },
          {
            option: 'value',
            value: newValue,
          },
        );

        Object.assign(newSliderOptions, {
          min: newMin,
          max: newMax,
          value: newValue,
        });
      } else {
        Object.assign(newSliderOptions, {
          [option]: panelValue,
        });
      }

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
    };
  }

  private _getPanelOptions(sliderOptions: Options): PanelOptions {
    const panelOptions = { ...sliderOptions };
    delete panelOptions.change;

    return panelOptions;
  }
}
