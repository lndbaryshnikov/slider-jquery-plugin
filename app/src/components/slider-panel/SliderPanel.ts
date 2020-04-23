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
          } else {
            newFirstValue = getCorrectedValue({
              value: valueArray[0],
              position: 'single',
              min: lastMin,
              max: lastMax,
              step: lastStep,
            });
          }

          valueArray[0] = newFirstValue;
        }

        if (areTwoValuePassed(valueArray)) {
          if (!wasRangeTrue) {
            newRange = true;
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
              min: lastMin,
              max: lastMax,
              step: lastStep,
            });

            if (isSecondEqualsOrLessThanFirst(correctFirstValue, correctSecondValue)) {
              correctFirstValue = correctSecondValue - lastStep;
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
              correctSecondValue = correctFirstValue + lastStep;
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
          this.configPanel.showError({
            option: 'step',
            errorMessage:
              `'${newStep}' - incorrect step, because it's not multiple of 'max' and 'min' difference`,
          });

          newStep = Math.round(newStep);

          while (lastDifference % newStep !== 0) {
            newStep -= 0.5;

            if (newStep === 0) {
              newStep = lastStep;

              break;
            }
          }
        }

        if (typeof lastValue === 'number') {
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

        const newDifference = newMax - newMin;

        while (newDifference % newStep !== 0) {
          newStep -= 0.5;

          if (newStep === 0) {
            newStep = lastStep;

            break;
          }
        }

        if (typeof lastValue === 'number') {
          newValue = getCorrectedValue({
            value: lastValue,
            position: 'single',
            min: newMin,
            max: newMax,
            step: newStep,
          });
        }

        if (Array.isArray(lastValue)) {
          const correctFirstValue = getCorrectedValue({
            value: lastValue[0],
            position: 'first',
            min: newMin,
            max: newMax,
            step: newStep,
          });

          const correctSecondValue = getCorrectedValue({
            value: lastValue[1],
            position: 'last',
            min: newMin,
            max: newMax,
            step: newStep,
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
            option: 'step',
            value: newStep,
          },
          {
            option: 'value',
            value: newValue,
          },
        );

        Object.assign(newSliderOptions, {
          step: newStep,
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
        alert(error);

        this.configPanel.setValue({
          option,
          value: lastOptions[option] as ConfigItemValue<ConfigItemType>,
        });
      }

      const newOptions = this.slider.getOptions() as Options;
      const {
        max,
        min,
        step,
        labels,
        pips,
      } = newOptions;

      const hasPips = !!pips;
      const hasLabels = !!labels;

      const pipsQuantity = ((max - min) / step) + 1;

      const newLabels = (hasLabels && (pipsQuantity > 16) ? false : labels) as boolean;

      const maybeTrue = hasLabels && (pipsQuantity > 16) ? true : pips;
      const newPips = hasPips && (pipsQuantity > 51) ? false : maybeTrue;

      const haveLabelsChanged = newLabels !== labels;
      const havePipsChanged = newPips !== pips;

      if (haveLabelsChanged) {
        this.slider.setOptions('labels', newLabels);

        this.configPanel.setValue({
          option: 'labels',
          value: newLabels,
        });
      }

      if (havePipsChanged) {
        this.slider.setOptions('pips', newPips);

        this.configPanel.setValue({
          option: 'pips',
          value: newPips,
        });
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
