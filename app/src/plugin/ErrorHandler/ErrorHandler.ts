import errorList from './errorList';

type ErrorObject = {
  type?: 'options' | 'plugin';
  option?: string;
  value?: string;
  errorCode: string;
};

class ErrorHandler {
  private handler: (message: string) => void;

  private static optionErrors = { ...errorList.optionErrors };

  private static pluginErrors = { ...errorList.pluginErrors };

  constructor(handler: (message: string) => void) {
    this.handler = handler;
  }

  static getOptionErrors(): typeof ErrorHandler.optionErrors {
    return {
      ...this.optionErrors,
    };
  }

  throw({
    type = 'options', option, errorCode, value,
  }: ErrorObject): void {
    let message: string;

    if (type === 'options') {
      const errorExpression = errorCode === 'incorrectOptionType'
        ? ErrorHandler.optionErrors.common[errorCode]
        : ErrorHandler.optionErrors[option || 'common'][errorCode];

      message = typeof errorExpression === 'function'
        ? errorExpression(option, value)
        : errorExpression;
    } else {
      message = ErrorHandler.pluginErrors[errorCode];
    }

    this.handler(message);
  }
}

export default ErrorHandler;
export { ErrorObject };
