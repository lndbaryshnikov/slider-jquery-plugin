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
    return ({ option, value: panelValue }: ValueObject): void => {
      const lastOptions = this.slider.getOptions() as Options;
      const {
        value: lastValue,
        range: lastRange,
        min: lastMin,
        max: lastMax,
        step: lastStep,
      } = lastOptions;

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

      if (option === 'value') {
        const valueArray = typeof panelValue === 'number'
          ? [panelValue]
          : (panelValue as number[]);

        let { range: newRange } = lastOptions;
        const { min, max, step } = lastOptions;

        const isOneValuePassed = (array: number[]): boolean => array.length === 1;
        const areTwoValuePassed = (array: number[]): boolean => array.length === 2;

        const getCorrectedValue = ({ value, position }: {
          value: number;
          position: 'first' | 'last' | 'single';
        }): number => {
          let formattedValue: number;

          if (position === 'single') {
            const maybeMaxOrClosest = value > max
              ? max
              : getClosestCorrectValue({ value, step, min });

            formattedValue = value < min ? min : maybeMaxOrClosest;
          }

          if (position === 'first') {
            const maybeAlmostMaxOrClosest = value > max
              ? max - step
              : getClosestCorrectValue({ value, step, min });

            formattedValue = value < min ? min : maybeAlmostMaxOrClosest;
          }

          if (position === 'last') {
            const maybeMaxOrClosest = value > max
              ? max
              : getClosestCorrectValue({ value, step, min });

            formattedValue = value < min ? min + step : maybeMaxOrClosest;
          }

          return formattedValue;
        };

        const wasRangeTrue = lastOptions.range === true;

        if (isOneValuePassed(valueArray)) {
          let correctFirstValue: number;

          if (wasRangeTrue) {
            valueArray.push(lastOptions.max);
            newRange = true;

            correctFirstValue = getCorrectedValue({
              value: valueArray[0],
              position: 'first',
            });

            if (correctFirstValue === max) {
              correctFirstValue -= step;
            }
          } else {
            correctFirstValue = getCorrectedValue({
              value: valueArray[0],
              position: 'single',
            });
          }

          valueArray[0] = correctFirstValue;
        }

        if (areTwoValuePassed(valueArray)) {
          if (!wasRangeTrue) {
            newRange = true;

            this.configPanel.setValue({
              option: 'range',
              value: 'true',
            });
          }

          const isSecondChanged = !wasRangeTrue || lastValue[1] !== valueArray[1];
          const isFirstChanged = wasRangeTrue && lastValue[0] !== valueArray[0];

          let [correctFirstValue, correctSecondValue] = valueArray;

          const isSecondEqualsOrLessThanFirst = (first: number, second: number) => {
            return second < first || second === first;
          };

          if (isSecondChanged) {
            correctSecondValue = getCorrectedValue({
              value: correctSecondValue,
              position: 'last',
            });

            if (isSecondEqualsOrLessThanFirst(correctFirstValue, correctSecondValue)) {
              correctFirstValue = correctSecondValue - step;
            }
          }

          if (isFirstChanged) {
            correctFirstValue = getCorrectedValue({
              value: correctFirstValue,
              position: 'first',
            });

            if (isSecondEqualsOrLessThanFirst(correctFirstValue, correctSecondValue)) {
              correctSecondValue = correctFirstValue + step;
            }
          }

          valueArray[0] = correctFirstValue;
          valueArray[1] = correctSecondValue;
        }

        this.configPanel.setValue({
          option,
          value: isOneValuePassed(valueArray) ? valueArray[0] : valueArray,
        });

        try {
          this.slider.setOptions({
            value: isOneValuePassed(valueArray) ? valueArray[0] : valueArray,
            range: newRange,
          });
        } catch (error) {
          alert(error);

          this.configPanel.setValue({
            option,
            value: lastValue,
          });

          this.configPanel.setValue({
            option: 'range',
            value: lastRange,
          });
        }
      } else if (option === 'range') {
        let { value: newValue } = lastOptions;

        const isRangeTruePassedWhenValueIsNotArray = panelValue === true
          && !Array.isArray(lastValue);

        if (isRangeTruePassedWhenValueIsNotArray) {
          newValue = [lastValue as number, lastOptions.max];

          this.configPanel.setValue({
            option: 'value',
            value: newValue,
          });
        }

        const isRangeNotTruePassedWhenValueIsArray = panelValue !== true
          && Array.isArray(lastValue);

        if (isRangeNotTruePassedWhenValueIsArray) {
          [newValue] = lastValue as number[];

          this.configPanel.setValue({
            option: 'value',
            value: newValue,
          });
        }

        try {
          this.slider.setOptions({
            value: newValue,
            [option]: panelValue,
          } as UserOptions);
        } catch (error) {
          alert(error);

          this.configPanel.setValue({
            option: 'value',
            value: lastValue,
          });

          this.configPanel.setValue({
            option,
            value: lastOptions[option],
          });
        }
      } else if (option === 'step') {
        let correctValue: number | [number, number];
        const newStep = panelValue as number;

        const lastDifference = lastMax - lastMin;
        const isNotAMultiple = lastDifference % newStep !== 0;

        const newDifference = isNotAMultiple
          ? Math.ceil(lastDifference / newStep) * newStep
          : lastDifference;

        const newMax = lastMin + newDifference;

        this.configPanel.setValue({
          option: 'max',
          value: newMax,
        });

        if (typeof lastValue === 'number') {
          correctValue = getClosestCorrectValue({
            value: lastValue,
            step: panelValue as number,
            min: lastMin,
          });

          console.log(lastValue, correctValue);

          this.configPanel.setValue({
            option: 'value',
            value: correctValue,
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
            } else if (correctSecondValue === newMax) {
              correctFirstValue = newMax - newStep;
            } else {
              correctSecondValue = correctFirstValue + newStep;
            }
          }

          correctValue = [correctFirstValue, correctSecondValue];
        }

        console.log(lastMax, newMax);

        try {
          this.slider.setOptions({
            max: newMax,
            value: correctValue,
            [option]: panelValue,
          } as UserOptions);
        } catch (error) {
          alert(error);

          this.configPanel.setValue({
            option: 'value',
            value: lastValue,
          });

          this.configPanel.setValue({
            option,
            value: lastOptions[option],
          });

          this.configPanel.setValue({
            option: 'max',
            value: lastMax,
          });
        }
        // } else if (option === 'min' || option === 'max') {
        //   const { min: lastMin, max: lastMax, step: lastStep } = lastOptions;

        //   let {
        //     min: newMin, max: newMax, value: newValue, step: newStep,
        //   } = lastOptions;

        //   if (option === 'min') {
        //     newMin = panelValue as number;

        //     if (newMin >= lastMax) {
        //       newMax = newMin + lastStep;
        //     }

        //     const newDifference = newMax - newMin;
        //     const isNotAMultipleOfNewDifference = newDifference % lastStep !== 0;

        //     if (isNotAMultipleOfNewDifference) {
        //       if (newDifference < lastStep) {
        //         if (newDifference > 1) newStep = 1;
        //       }
        //     }

        //     if (typeof lastValue === 'number') {
        //       const maybeEqualsNewMax = lastValue > newMax ? newMax : lastValue;

        //       newValue = lastValue < newMin ? newMin : maybeEqualsNewMax;
        //     }

      //     // if (Array.isArray(lastValue)) {
      //     //   const maybeEqualsNewMax = lastValue > newMax ? newMax : lastValue;
      //     //   newValue = lastValue < newMin ? newMin : maybeEqualsNewMax;
      //     // }
      //   }
      } else {
        try {
          this.slider.setOptions(option, panelValue);
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
