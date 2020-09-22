import MainView, { MainStyles } from '../View/MainView';
import Model from '../Model/Model';
import { UserOptions, Options } from '../Model/modelOptions';
import ErrorHandler, { ErrorObject } from '../ErrorHandler/ErrorHandler';

type CompleteUserOptions = UserOptions & { styles?: MainStyles & { tooltip?: string } };

class Presenter {
  constructor(private view: MainView, private model: Model) {
    model.whenOptionsSet(this.updateView);
    model.whenOptionsIncorrect(this.showError);
    view.whenValueChanged(this.validateNewValue);
    model.whenValueUpdated(this.updateValue);
  }

  getModel(): Model {
    return this.model;
  }

  getView(): MainView {
    return this.view;
  }

  initialize(root: HTMLElement, userOptions?: UserOptions): void {
    if (this.view.isRendered()) {
      this.showError({ type: 'plugin', errorCode: 'rendered' });
    }

    this.setOptions(userOptions);
    this.render(root);
  }

  setOptions(options?: CompleteUserOptions): void {
    if (!options) {
      this.model.setOptions();
      return;
    }

    if (typeof options !== 'object') {
      this.showError({ errorCode: 'notAnObject' });
    }

    const modelOptions = { ...options };
    const { styles } = options;
    const viewStyles = styles ? { ...styles } : undefined;

    if (styles) {
      delete modelOptions.styles;
    }

    this.view.setStyles(viewStyles);
    this.model.setOptions(modelOptions);
  }

  getOptions(): CompleteUserOptions {
    const modelOptions = this.model.getOptions();
    const viewStyles = this.view.getStyles();

    if (viewStyles) {
      return { ...modelOptions, styles: { ...viewStyles } };
    }
    return { ...modelOptions };
  }

  render(root: HTMLElement): void {
    if (!this.model.isSetUp()) {
      this.showError({ type: 'plugin', errorCode: 'notSetUp' });
    }
    if (this.view.isRendered()) {
      this.showError({ type: 'plugin', errorCode: 'rendered' });
    }

    this.view.render(root);
  }

  destroy(): void {
    this.view.destroy();
  }

  updateView = (): void => {
    const options = this.model.getOptions();

    this.view.setOptions(options);
  }

  showError = (errorObject: ErrorObject): void => {
    const handler = (message: string): void => { throw new Error(message); };

    new ErrorHandler(handler).throw(errorObject);
  }

  validateNewValue = (value: Options['value']): void => {
    this.model.refreshValue(value);
  }

  updateValue = (): void => {
    const options = this.model.getOptions();
    const { value, change } = options;

    this.view.updateValue(value);

    if (change && typeof change === 'function') {
      change(options.value);
    }
  }
}

export default Presenter;
export {
  CompleteUserOptions,
};
