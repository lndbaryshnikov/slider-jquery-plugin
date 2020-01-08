import areArraysEqual from '../../functions/common/areArraysEqual';
import Observer from '../Observer';

type HorizontalClasses = {
  'jquery-slider jquery-slider-horizontal': string;
  'jquery-slider-range': string;
  'jquery-slider-handle': string;
}

type VerticalClasses = {
  'jquery-slider jquery-slider-vertical': string;
  'jquery-slider-range': string;
  'jquery-slider-handle': string;
}

type ValueFunction = (value?: Options['value']) => string | number;

type ChangeFunction = ((value: number | number[]) => void);

type Options = {
  min: number;
  max: number;
  step: number;
  value: number | number[];
  orientation: 'horizontal' | 'vertical';
  range: 'min' | 'max' | boolean;
  tooltip: boolean | ValueFunction;
  animate: 'slow' | 'fast' | false | number;
  labels: true | false | ValueFunction;
  pips: boolean;
  change: ChangeFunction | false;

  classes: HorizontalClasses | VerticalClasses;
};

type UserOptions = {
  min?: number;
  max?: number;
  step?: number;
  value?: number | number[];
  orientation?: 'horizontal' | 'vertical';
  range?: 'min' | 'max' | boolean;
  tooltip?: boolean | ValueFunction;
  animate?: 'slow' | 'fast' | false | number;
  labels?: true | false | ValueFunction;
  pips?: boolean;
  change?: ChangeFunction | false;

  classes?: {
    'jquery-slider'?: string;
    'jquery-slider-range'?: string;
    'jquery-slider-handle'?: string;
  };
};

type RestOptionsToSet = (UserOptions[keyof UserOptions] | UserOptions['classes'][keyof UserOptions['classes']]);

class SliderModel {
  private _incorrectOptionsReceivedSubject = new Observer();

  private _optionsSetSubject = new Observer();

  private _valueUpdatedSubject = new Observer();

  private _options: Options | null = null;

  private _classes = {
    slider: {
      main: 'jquery-slider' as keyof UserOptions['classes'],
      orientation: (orientation: 'horizontal' | 'vertical'): keyof Options['classes'] => `jquery-slider-${orientation}` as keyof Options['classes'],
      complete: (orientation: 'horizontal' | 'vertical'): keyof Options['classes'] => `jquery-slider jquery-slider-${orientation}` as keyof Options['classes'],
      horizontal: 'jquery-slider-horizontal' as keyof Options['classes'],
      vertical: 'jquery-slider-vertical' as keyof Options['classes'],
    },
    range: 'jquery-slider-range' as keyof Options['classes'],
    firstHandle: 'jquery-slider-handle' as keyof Options['classes'],
  };

  private static _optionsErrors = {
    notSet: 'Options are not set (to set options pass options object)',
    alreadySet: 'Options are already set (to change - provide options)',
    incorrectOptions: 'Incorrect options (should be object or key - value pairs)',
    incorrectOptionsObject: 'Options are incorrect (should correspond the required format)',
    options: {
      notExisting: (option: string): string => `Option "${option}" doesn't exist`,
      incorrectType: (option: string, type: string): string => `Options are incorrect (option '${option}' should be of type '${type}')`,
    },
    classes: {
      notExisting: (className: string): string => `Class "${className}" does not exist`,
      contains: "Only option 'classes' contains classes",
      twoExtra: "Only option 'classes' can have two extra arguments",
      customIsNotString: 'Class is incorrect (should be a string)',
      extraWs: "Options are incorrect (main classes shouldn't have extra whitespaces)",
      incorrectType: 'Options are incorrect (classes should correspond the required format)',
    },
    value: {
      beyond: "Options are incorrect ('value' cannot go beyond 'min' and 'max')",
      incorrectType: "Options are incorrect ('value' can only be of type 'number' or 'array')",
      incorrectArray: "Options are incorrect ('value' array should contain two numbers)",
      rangeNotTrue: "Options are incorrect (array is allowed for 'value' when 'range' is true)",
      rangeTrue: "Options are incorrect ('value' should be array when 'range' is true)",
    },
    minAndMax: {
      lessOrMore: (option: string, lessOrMore: 'less' | 'more'): string => `Options are incorrect (option '${option}' cannot be ${lessOrMore} than 'value')`,
    },
    orientation: {
      incorrect: "Options are incorrect (for orientation only 'vertical' and 'horizontal' values are allowed)",
    },
    range: {
      incorrect: "Options are incorrect (option 'range' can only be 'min', 'max' or typeof 'boolean')",
    },
    step: {
      incorrect: "Options are incorrect (option 'step' value should be between 'min' and 'max')",
    },
    tooltip: {
      incorrect: "Options are incorrect (option 'tooltip' should be boolean true or false, or function)",
      incorrectFunction: "Options are incorrect ('tooltip's function should return string or number)",
    },
    animate: {
      incorrect: "Options are incorrect (option 'animate' should be 'false', 'slow', 'fast' or number)",
    },
    labels: {
      incorrect: "Options are incorrect (option 'labels' can only be true false, "
                + 'or function returning string or number)',
      incorrectFunction: "Options are incorrect ('labels' function should return string or number)",
    },
    pips: {
      incorrect: "Options are incorrect (option 'pips' should be true or false)",
    },
    change: {
      incorrect: "Options are incorrect (option 'change' can be only function or false)",
      incorrectFunction: "Options are incorrect ('change' function has "
                + 'two arguments and return undefined)',
    },
  };

  whenOptionsAreIncorrect(callback: (error: string) => void): void {
    this._incorrectOptionsReceivedSubject.addObserver((error: string) => {
      callback(error);
    });
  }

  whenOptionsSet(callback: () => void): void {
    this._optionsSetSubject.addObserver(() => {
      callback();
    });
  }

  whenValueUpdated(callback: () => void): void {
    this._valueUpdatedSubject.addObserver(() => {
      callback();
    });
  }

  static get optionsErrors() {
    return SliderModel._optionsErrors;
  }

  static getDefaultOptions(orient: 'horizontal' | 'vertical' | undefined): Options {
    const orientation = orient || 'horizontal';

    let classes: Options['classes'];

    if (orientation === 'horizontal') {
      classes = {
        'jquery-slider jquery-slider-horizontal': '',
        'jquery-slider-range': '',
        'jquery-slider-handle': '',
      };
    }
    if (orientation === 'vertical') {
      classes = {
        'jquery-slider jquery-slider-vertical': '',
        'jquery-slider-range': '',
        'jquery-slider-handle': '',
      };
    }

    return {
      min: 0,
      max: 100,
      step: 1,
      value: 0,
      orientation,
      range: false,
      tooltip: false,
      animate: 'fast',
      pips: false,
      labels: false,
      change: false,

      classes,
    };
  }

  refreshValue(valueData: [number, string]): void {
    let value = valueData[0];
    const valueNumber = valueData[1];

    if (value < this._options.min) value = this._options.min;
    if (value > this._options.max) value = this._options.max;

    const isRangeNotTrue = typeof this._options.value === 'number' && this._options.range !== true;

    if (isRangeNotTrue) {
      this._options.value = value;
    }

    const isRangeTrue = Array.isArray(this._options.value) && this._options.range === true;

    if (isRangeTrue) {
      const comparingValueIndex = valueNumber === 'first' ? 1 : 0;
      const optionsValueArray = this._options.value as number[];

      if (value === optionsValueArray[comparingValueIndex]) {
        const multiplier = valueNumber === 'first' ? -1 : 1;
        value += multiplier * this._options.step;
      }

      optionsValueArray[valueNumber === 'first' ? 0 : 1] = value;
    }

    this._valueUpdatedSubject.notifyObservers();
  }

  destroy(): void {
    if (!this._options) {
      this._throw(SliderModel._optionsErrors.notSet);
    }

    this._options = null;
  }

  getOptions(option?: keyof Options, className?: keyof UserOptions['classes']): Options | Options[keyof Options] |
  Options['classes'][keyof Options['classes']] {
    const errors = SliderModel._optionsErrors;
    const areOptionsExist = !!this._options;

    if (!areOptionsExist) {
      this._throw(SliderModel._optionsErrors.notSet);

      return;
    }

    const areArgumentsNotProvided = !option && !className;

    if (areArgumentsNotProvided) return this._options;

    if (option) {
      const isOptionsCorrect = option in this._options;
      if (!isOptionsCorrect) {
        this._throw(errors.options.notExisting(option));

        return;
      }

      const userClasses: (keyof UserOptions['classes'])[] = [
        this._classes.slider.main,
        this._classes.range,
        this._classes.firstHandle,
      ];

      const isClassIncorrect = className && !userClasses.includes(className);

      if (isClassIncorrect) {
        this._throw(errors.classes.notExisting(className));

        return;
      }

      const areTwoArgumentsProvided = option && !!className;
      const isClassOptionRequested = option === 'classes';

      if (areTwoArgumentsProvided && !isClassOptionRequested) {
        this._throw(errors.classes.contains);

        return;
      }

      if (option && !className) {
        return this._options[option];
      }

      const resultClassName = className === this._classes.slider.main
        ? this._classes.slider.complete(this._options.orientation) : className;

      return this._options.classes[resultClassName as keyof Options['classes']];
    }
  }

  setOptions(
    options?: UserOptions | keyof Options,
    ...restOptions: RestOptionsToSet[]
  ): void | false {
    const errors = SliderModel._optionsErrors;

    const areRestOptionsProvided = restOptions.length !== 0;
    const isOptionsArgumentString = typeof options === 'string';
    const isOnlyOptionsObjectProvided = typeof options === 'object' && restOptions.length === 0;
    const areArgumentsNotProvided = !options && restOptions.length === 0;


    if (areRestOptionsProvided && isOptionsArgumentString) {
      const areOptionsSet = !!this._options;

      if (!areOptionsSet) {
        this._throw(SliderModel._optionsErrors.notSet);

        return;
      }

      if (restOptions.length === 1 || restOptions.length === 2) {
        const optionsObject = this._extendBySingleOption(
          options as keyof Options,
          ...restOptions as (keyof UserOptions['classes'] | UserOptions[keyof UserOptions])[],
        );

        if (!optionsObject.result) return false;

        this._options = optionsObject.options;

        optionsObject.options = null;

        this._deleteWSFromUserCLasses();
      }
    } else if (isOnlyOptionsObjectProvided) {
      const optionsObject = this._extendByOptionsObject(options as UserOptions);

      if (!optionsObject.result) return;

      this._options = optionsObject.options;

      this._deleteWSFromUserCLasses();
    } else if (areArgumentsNotProvided) {
      const areOptionsSet = !!this._options;

      if (areOptionsSet) {
        this._throw(errors.alreadySet);

        return;
      }

      this._options = SliderModel.getDefaultOptions('horizontal');
    } else {
      return this._throw(errors.incorrectOptions);
    }

    this._optionsSetSubject.notifyObservers();
  }

  private _extendByOptionsObject(
    options: UserOptions,
  ): { result: false } | { options: Options; result: true } {
    let currentOptions: Options;

    if (this._options) {
      currentOptions = $.extend(true, {}, this._options);

      const isOrientationOptionProvided = !!(options as Options).orientation;
      const doOrientationsDiffer = (options).orientation !== this._options.orientation;

      if (isOrientationOptionProvided && doOrientationsDiffer) {
        const optionsObject = this._changeOrientationClass(currentOptions, 'result', (options).orientation);

        optionsObject.options = null;

        if (!optionsObject.result) return { result: false };
      }

      const optionsObject = this._changeOrientationClass(options, 'user',
        (options).orientation ? (options).orientation
          : this._options.orientation);

      optionsObject.options = null;

      if (!optionsObject.result) return { result: false };
    } else {
      currentOptions = SliderModel.getDefaultOptions((options).orientation);

      const optionsObject = this._changeOrientationClass(options, 'user', (options).orientation);

      optionsObject.options = null;

      if (!optionsObject.result) return { result: false };
    }

    let defaultOptions: Options | null = $.extend(true, {}, currentOptions);

    const extendedOptions: Options = $.extend(true, defaultOptions, options);

    defaultOptions = null;

    if (!this._checkOptions(extendedOptions)) {
      return { result: false };
    }
    return {
      options: extendedOptions,
      result: true,
    };
  }

  private _extendBySingleOption(
    option: keyof Options,
    ...restOptions: (keyof UserOptions['classes'] | UserOptions[keyof UserOptions])[]
  ): { result: boolean; options?: Options } {
    const errors = SliderModel.optionsErrors;

    if (!(option in this._options)) {
      this._throw(errors.options.notExisting(option));

      return { result: false };
    }

    const optionsCopy = $.extend(true, {}, this._options);

    if (restOptions.length === 1) {
      const isExtendingByClassesRequested = option === 'classes' && typeof restOptions[0] === 'object';

      if (isExtendingByClassesRequested) {
        const classes = restOptions[0] as UserOptions['classes'];

        if (this._classes.slider.main in classes) {
          classes[
            this._classes.slider.complete(this._options.orientation)
          ] = classes[this._classes.slider.main];

          delete classes[this._classes.slider.main];
        }

        $.extend(optionsCopy.classes, classes);
      } else if (option === 'orientation') {
        if (restOptions[0] !== optionsCopy.orientation) {
          this._changeOrientationClass(optionsCopy,
            'result',
            restOptions[0] as Options['orientation']);

          optionsCopy[option] = restOptions[0] as Options['orientation'];
        }
      } else if (option === 'min' || option === 'max') {
        if (typeof restOptions[0] !== 'number') {
          this._throw(errors.options.incorrectType(option, 'number'));

          return { result: false };
        }

        if (typeof this._options.value === 'number') {
          // when range is not true and value is number
          const isMinGoAfterValue = option === 'min' && restOptions[0] > this._options.value;
          const isMaxGoBeforeValue = option === 'max' && restOptions[0] < this._options.value;

          if (isMinGoAfterValue || isMaxGoBeforeValue) {
            this._throw(errors.minAndMax.lessOrMore(option,
              option === 'min' ? 'more' : 'less'));

            return { result: false };
          }
        }
        if (Array.isArray(this._options.value)) {
          // when range is true and value is array
          const isMinGoAfterValue = (option === 'min' && (restOptions[0] > this._options.value[0]
              || restOptions[0] > this._options.value[1]));
          const isMaxGoBeforeValue = (option === 'max' && (restOptions[0] < this._options.value[0]
              || restOptions[0] < this._options.value[1]));

          if (isMinGoAfterValue || isMaxGoBeforeValue) {
            this._throw(errors.minAndMax.lessOrMore(option,
              option === 'min' ? 'more' : 'less'));

            return { result: false };
          }
        }

        optionsCopy[option] = restOptions[0] as Options['min' | 'max'];
      } else {
        const optionObj: any = {};
        // eslint-disable-next-line prefer-destructuring
        optionObj[option] = restOptions[0];

        $.extend(optionsCopy, optionObj as Options);
      }

      if (!this._checkOptions(optionsCopy)) return { result: false };

      return {
        result: true,
        options: optionsCopy,
      };
    }

    if (restOptions.length === 2) {
      if (option !== 'classes') {
        this._throw(errors.classes.twoExtra);

        return { result: false };
      }

      const classNames = [
        this._classes.slider.main,
        this._classes.range,
        this._classes.firstHandle,
      ];

      const isClassNameCorrect = typeof restOptions[0] !== 'string'
                || !classNames.includes(restOptions[0] as keyof UserOptions['classes']);

      if (isClassNameCorrect) {
        this._throw(errors.classes.notExisting(restOptions[0] as string));

        return { result: false };
      }

      let className: keyof Options['classes'];

      if (restOptions[0] === this._classes.slider.main) {
        className = this._classes.slider.complete(this._options.orientation);
      } else {
        className = restOptions[0] as keyof Options['classes'];
      }

      if (typeof restOptions[1] !== 'string') {
        this._throw(errors.classes.customIsNotString);

        return { result: false };
      }

      optionsCopy[option as 'classes'][className] = restOptions[1] as keyof Options['classes'];

      if (!this._checkOptions(optionsCopy)) return { result: false };

      return {
        result: true,
        options: optionsCopy,
      };
    }
  }

  private _checkOptions(options: Options): boolean {
    const defaults = SliderModel.getDefaultOptions(options.orientation);

    const errors = SliderModel._optionsErrors;

    const optionsKeys = Object.keys(options);
    const defaultOptionsKeys = Object.keys(defaults);

    if (!areArraysEqual(optionsKeys, defaultOptionsKeys)) {
      this._throw(errors.incorrectOptionsObject);

      return false;
    }

    let mainClass: keyof typeof options.classes;

    // eslint-disable-next-line no-restricted-syntax
    for (mainClass in options.classes) {
      if (Object.prototype.hasOwnProperty.call(options.classes, mainClass)) {
        if (mainClass.trim() !== mainClass) {
          this._throw(errors.classes.extraWs);

          return false;
        }
      }
    }

    const classesKeys = Object.keys(options.classes);
    const defaultClassesKeys = Object.keys(defaults.classes);

    if (!areArraysEqual(classesKeys, defaultClassesKeys)) {
      this._throw(errors.classes.incorrectType);

      return false;
    }

    // eslint-disable-next-line no-restricted-syntax
    for (mainClass in options.classes) {
      if (Object.prototype.hasOwnProperty.call(options.classes, mainClass)) {
        if (typeof options.classes[mainClass] !== 'string') {
          this._throw(errors.options.incorrectType('classes', 'string'));

          return false;
        }
      }
    }

    const checkType = (
      type: 'string' | 'number' | 'boolean',
      optionsObj: Options,
      ...params: (keyof Options)[]
    ): boolean => {
      // eslint-disable-next-line no-restricted-syntax
      for (const param of params) {
        if (typeof optionsObj[param] !== type) {
          this._throw(errors.options.incorrectType(param, type));

          return false;
        }
      }

      return true;
    };

    if (!checkType('number', options, 'min', 'max', 'step')) {
      return false;
    }

    const isValueNotCorrect = typeof options.value !== 'number' && !Array.isArray(options.value);

    if (isValueNotCorrect) {
      this._throw(errors.value.incorrectType);

      return false;
    }

    const isOrientationNotCorrect = options.orientation !== 'horizontal' && options.orientation !== 'vertical';

    if (isOrientationNotCorrect) {
      this._throw(errors.orientation.incorrect);

      return false;
    }

    const isRangeNotCorrect = options.range !== 'min' && options.range !== 'max'
            && typeof options.range !== 'boolean';

    if (isRangeNotCorrect) {
      this._throw(errors.range.incorrect);

      return false;
    }

    if (options.range !== true && Array.isArray(options.value)) {
      this._throw(errors.value.rangeNotTrue);
    }

    if (options.range === true && !Array.isArray(options.value)) {
      this._throw(errors.value.rangeTrue);
    }

    if (Array.isArray(options.value)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const value of options.value) {
        const isValueBetweenMinAndMax = options.min <= value && options.max >= value;

        if (!isValueBetweenMinAndMax) {
          this._throw(errors.value.beyond);

          return false;
        }
      }
    } else {
      const isValueBetweenMinAndMax = options.min <= options.value && options.max >= options.value;

      if (!isValueBetweenMinAndMax) {
        this._throw(errors.value.beyond);

        return false;
      }
    }

    const isStepNotCorrect = options.step > (options.max - options.min) || options.step <= 0;

    if (isStepNotCorrect) {
      this._throw(errors.step.incorrect);

      return false;
    }

    const isTooltipNotCorrect = typeof options.tooltip !== 'boolean' && typeof options.tooltip !== 'function';

    if (isTooltipNotCorrect) {
      this._throw(errors.tooltip.incorrect);

      return false;
    }

    if (typeof options.tooltip === 'function') {
      const expectedValue = options.tooltip(options.value);
      const isExpectedValueNotStringAndNotNumber = typeof expectedValue !== 'number'
                && typeof expectedValue !== 'string';

      if (isExpectedValueNotStringAndNotNumber) {
        this._throw(errors.tooltip.incorrectFunction);

        return false;
      }
    }

    const isAnimateNotCorrect = options.animate !== false && options.animate !== 'slow' && options.animate !== 'fast'
            && typeof options.animate !== 'number';

    if (isAnimateNotCorrect) {
      this._throw(errors.animate.incorrect);

      return false;
    }

    if (typeof options.pips !== 'boolean') {
      this._throw(errors.pips.incorrect);

      return false;
    }

    const isLabelsNotCorrect = typeof options.labels !== 'function' && typeof options.labels !== 'boolean';

    if (isLabelsNotCorrect) {
      this._throw(errors.labels.incorrect);

      return false;
    }

    if (typeof options.labels === 'function') {
      const result = options.labels(options.value);
      if (typeof result !== 'string' && typeof result !== 'number') {
        this._throw(errors.labels.incorrectFunction);

        return false;
      }
    }

    const isChangeOptionNotCorrect = typeof options.change !== 'function' && options.change !== false;

    if (isChangeOptionNotCorrect) {
      this._throw(errors.change.incorrect);

      return false;
    }

    if (typeof options.change === 'function') {
      const func = options.change;

      if (typeof func(options.value) !== 'undefined') {
        this._throw(errors.change.incorrectFunction);

        return;
      }
    }

    return true;
  }

  private _changeOrientationClass(
    options: Options | UserOptions,
    type: 'user' | 'result',
    orientation: 'horizontal' | 'vertical' | undefined,
  ): { result: boolean; options?: Options | UserOptions } {
    const optionsCopy: Options | UserOptions = {};

    Object.entries(options).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      optionsCopy[key] = value;
    });
    const isOrientationNotCorrect = orientation !== undefined && orientation !== 'horizontal'
            && orientation !== 'vertical';

    if (isOrientationNotCorrect) {
      this._throw(SliderModel._optionsErrors.orientation.incorrect);

      return { result: false };
    }

    const correctOrientation = (orientation === undefined)
      ? 'horizontal' : orientation;

    const isUserOptionsProcessingRequired = type === 'user';
    const isMainClassGiven = !!optionsCopy.classes
        && !!optionsCopy.classes[this._classes.slider.main];
    // only main class is extending

    if (isUserOptionsProcessingRequired && isMainClassGiven) {
      optionsCopy.classes[
        this._classes.slider.complete(correctOrientation)
      ] = optionsCopy.classes[this._classes.slider.main];

      delete optionsCopy.classes[this._classes.slider.main];
    }

    const isResultOptionsProcessingRequired = type === 'result';

    if (isResultOptionsProcessingRequired) {
      let mainClass: keyof Options['classes'];
      const values: string[] = [];

      // eslint-disable-next-line no-restricted-syntax
      for (mainClass as string in optionsCopy.classes) {
        if (Object.prototype.hasOwnProperty.call(optionsCopy.classes, mainClass)) {
          values.push(optionsCopy.classes[mainClass]);

          delete optionsCopy.classes[mainClass];
        }
      }

      [
        optionsCopy.classes[this._classes.slider.complete(correctOrientation)],
        optionsCopy.classes[this._classes.range],
        optionsCopy.classes[this._classes.firstHandle],
      ] = values;
    }

    return {
      result: true,
      options: optionsCopy as Options | UserOptions,
    };
  }

  private _deleteWSFromUserCLasses(): void {
    const { classes } = this._options;

    Object.keys(this._options.classes).forEach((key: keyof typeof classes) => {
      if (Object.prototype.hasOwnProperty.call(this._options.classes, key)) {
        if (this._options.classes[key] !== '') {
          this._options.classes[key] = this._options.classes[key]
            .trim()
            .replace(/\s+/g, ' ');
        }
      }
    });
  }

  private _throw(error: string): void {
    this._incorrectOptionsReceivedSubject.notifyObservers(error);
  }
}

export default SliderModel;

export {
  HorizontalClasses,
  VerticalClasses,
  ValueFunction,
  ChangeFunction,
  Options,
  UserOptions,
  RestOptionsToSet,
};
