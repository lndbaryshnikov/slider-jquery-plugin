import Observer from '../Observer/Observer';
import { ErrorObject } from '../ErrorHandler/ErrorHandler';
import modelOptions, { Options, UserOptions } from './modelOptions';
import modelValidationUtils from './modelValidationUtils';

class Model {
  private options: Options;

  private errorSubject = new Observer();

  private optionsSetSubject = new Observer();

  private valueUpdatedSubject = new Observer();

  isSetUp(): boolean {
    return !!this.options;
  }

  whenOptionsIncorrect(callback: (errorObject: ErrorObject) => void): void {
    this.errorSubject.addObserver((errorObject: ErrorObject): void => {
      callback(errorObject);
    });
  }

  whenOptionsSet(callback: () => void): void {
    this.optionsSetSubject.addObserver(() => {
      callback();
    });
  }

  whenValueUpdated(callback: () => void): void {
    this.valueUpdatedSubject.addObserver(() => {
      callback();
    });
  }

  getOptions(): Options {
    if (!this.options) {
      this.errorSubject.notifyObservers({ errorCode: 'notSet' });
    }
    return this.options;
  }

  static get defaultOptions(): Options {
    return { ...modelOptions };
  }

  setOptions(userOptions?: UserOptions): void {
    const areUserOptionsCorrect = this.checkUserOptions(userOptions);

    if (!areUserOptionsCorrect) return;

    const fullOptions = !userOptions ? { ...modelOptions } : {
      ...(this.options ? this.options : modelOptions),
      ...userOptions,
    };

    if (userOptions) {
      const areOptionsCorrect = this.checkFullOptions(fullOptions);
      if (!areOptionsCorrect) return;
    }

    this.options = fullOptions;
    this.optionsSetSubject.notifyObservers();
  }

  refreshValue(value: Options['value']): void {
    const newOptions = { ...this.options, value };

    const { result, errorCode } = modelValidationUtils.validateValue(newOptions);

    if (!result) {
      this.errorSubject.notifyObservers({ option: 'value', errorCode });
    } else {
      this.options.value = value;

      this.valueUpdatedSubject.notifyObservers();
    }
  }

  private checkUserOptions(userOptions: UserOptions): boolean {
    const { errorSubject } = this;

    const isObjectPassed = (
      typeof userOptions === 'object'
      && Object.getPrototypeOf(userOptions) === Object.prototype
    );
    const isNothingPassed = !userOptions;

    if (!isObjectPassed && !isNothingPassed) {
      errorSubject.notifyObservers({ errorCode: 'notAnObject' });
      return false;
    }

    const areOptionsSetWhenNothingPassed = !!this.options && isNothingPassed;

    if (areOptionsSetWhenNothingPassed) {
      errorSubject.notifyObservers({ errorCode: 'alreadySet' });
      return false;
    }

    return true;
  }

  private checkFullOptions(fullOptions: Options): boolean {
    const { errorSubject } = this;

    const {
      areOptionsKeysCorrect,
      findIncorrectTypeOption,
    } = modelValidationUtils;

    if (!areOptionsKeysCorrect(fullOptions)) {
      errorSubject.notifyObservers({ errorCode: 'incorrectNames' });
      return false;
    }

    const notANumber = findIncorrectTypeOption(fullOptions, 'number', 'min', 'max', 'step');

    if (notANumber) {
      errorSubject.notifyObservers({
        errorCode: 'incorrectOptionType',
        option: notANumber,
        value: 'number',
      });
      return false;
    }

    // Options order is important
    const errorObject = this.checkSingleOption(
      fullOptions,
      'range',
      'orientation',
      'step',
      'value',
      'step',
      'value',
      'tooltip',
      'labels',
      'animate',
      'pips',
      'change',
    );

    if (errorObject) {
      errorSubject.notifyObservers(errorObject);
      return false;
    }
    return true;
  }

  private checkSingleOption(
    fullOptions: Options,
    ...optionNames: (keyof Options)[]
  ): ErrorObject | undefined {
    let errorObject: ErrorObject;

    optionNames.some((name) => {
      const nameWithCapital = `${name[0].toUpperCase()}${name.slice(1)}`;
      const validator = modelValidationUtils[`validate${nameWithCapital}`];
      const { result, errorCode } = validator(fullOptions);

      if (!result) {
        errorObject = { errorCode, option: name };
        return true;
      }
      return false;
    });
    return errorObject;
  }
}

export default Model;
