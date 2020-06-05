import Observer from '../Observer/Observer';

class OptionsErrorHandler {
  private static commonErrors = {
    notSet: 'Options are not set (to set options pass options object)',
    alreadySet: 'Options are already set (to change - provide options)',
    incorrectObject: 'should be object or key - value pairs',
    incorrectObjectFormat: 'should correspond the required format',
    notExistingOption: (option: string): string => `option ${option} does not exist`,
    incorrectOptionType: (option: string, type: string): string => (
      `option ${option} should be of type ${type}`
    ),
  }

  private static specificErrors = {
    classes: {
      notExistingClass: (className: string): string => `class ${className} does not exist`,
      contains: 'only option classes contains classes',
      twoExtra: 'only option classes can have two extra arguments',
      customIsNotString: 'classes should be string',
      extraWs: 'main classes should not have extra whitespaces',
      incorrectType: 'classes should correspond the required format',
    },
    value: {
      beyond: 'value cannot go beyond min and max',
      incorrectType: 'value can only be of type number or array',
      incorrectArray: 'value array should contain two numbers',
      rangeNotTrue: 'array is allowed for value when range is true',
      rangeTrue: 'value should be array when range is true',
      firstMoreThanSecond: 'first value should be less than second',
      notMultipleOfStep: 'value should be multiple of step',
    },
    minAndMax: {
      lessOrMoreThanValue: (option: string, lessOrMore: 'less' | 'more'): string => (
        `option ${option} cannot be ${lessOrMore} than value`
      ),
    },
    orientation: {
      incorrect: 'orientation can only be vertical or horizontal',
    },
    range: {
      incorrect: 'range can only equals min, max, true or false',
    },
    step: {
      incorrect: 'step should be between min and max',
      notAMultiple: 'step should be a multiple of min and max difference',
    },
    tooltip: {
      incorrect: 'tooltip should be true, false or function',
      incorrectFunction: 'tooltip function should return string or number',
    },
    animate: {
      incorrect: 'animate can only be false, slow, fast or number',
    },
    labels: {
      incorrect: 'labels can only be true, false or function',
      incorrectFunction: 'labels function should return string or number',
    },
    pips: {
      incorrect: 'pips can only be true or false',
    },
    change: {
      incorrect: 'change can only be function or false',
      incorrectFunction: 'change function has two arguments and return undefined',
    },
  }

  private errorSubject = new Observer();

  whenErrorAppeared(callback: (message: string) => void): void {
    this.errorSubject.addObserver((message: string) => {
      callback(message);
    });
  }

  static get optionsErrors(): typeof OptionsErrorHandler.specificErrors
    & typeof OptionsErrorHandler.commonErrors {
    const { commonErrors, specificErrors } = OptionsErrorHandler;

    return {
      ...commonErrors,
      ...specificErrors,
    };
  }

  throw({ option, value, errorCode }: {
    option?: string;
    value?: string;
    errorCode: string;
  }): void {
    const { specificErrors, commonErrors } = OptionsErrorHandler;
    let message: string;

    if (!option) {
      message = commonErrors[errorCode];
    } else {
      const isErrorCommon = errorCode === 'notExistingOption'
        || errorCode === 'incorrectOptionType';

      if (isErrorCommon) {
        message = commonErrors[errorCode](option, value);
      } else {
        const isMinOrMax = option === 'min' || option === 'max';

        if (isMinOrMax) {
          message = specificErrors.minAndMax.lessOrMoreThanValue(
            option, (value as 'less' | 'more'),
          );
        } else {
          const specificErrorExpression = (
            specificErrors[option][errorCode]
          );

          message = typeof specificErrorExpression === 'function'
            ? specificErrorExpression(value)
            : specificErrorExpression;
        }
      }
    }

    this.errorSubject.notifyObservers(message);
  }
}

export default OptionsErrorHandler;
