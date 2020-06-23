import MainView, { MainStyles } from '../View/MainView';
import { UserOptions, Options } from '../Model/modelOptions';
import ErrorHandler, { ErrorObject } from '../ErrorHandler/ErrorHandler';
import Model from '../Model/Model';
import LabelsView, { LabelOptions } from '../View/LabelsView';
import TooltipView from '../View/TooltipView';

type CompleteUserOptions = UserOptions & { styles?: MainStyles & { tooltip: string } };

class Presenter {
  private plugins = {
    tooltipView: {
      first: new TooltipView(),
      second: new TooltipView(),
    },
    labelsView: new LabelsView(),
  }

  private pluginStyles: {
    tooltip: string;
  }

  constructor(private view: MainView, private model: Model) {
    model.whenOptionsSet(this.updateView.bind(this));
    model.whenOptionsIncorrect(this.showError.bind(this));
    view.whenValueChanged(this.validateNewValue.bind(this));
    model.whenValueUpdated(this.updateValue.bind(this));

    const { labelsView } = this.plugins;
    labelsView.whenUserClicksOnLabel(this.updateHandlePosition.bind(this));
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
      return;
    }

    const modelOptions = { ...options };
    const { styles } = options;
    const viewStyles = styles ? { ...styles } : undefined;

    if (styles) {
      delete modelOptions.styles;

      const tooltipStyle = styles.tooltip;
      if (tooltipStyle) {
        this.pluginStyles = { tooltip: tooltipStyle };
        delete viewStyles.tooltip;
      }
    }

    this.view.setStyles(viewStyles);
    this.model.setOptions(modelOptions);
  }

  getOptions(): CompleteUserOptions {
    const modelOptions = this.model.getOptions();
    const viewStyles = this.view.getStyles();

    if (viewStyles) {
      return { ...modelOptions, styles: { ...viewStyles, ...this.pluginStyles } };
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

    const {
      first: firstTooltipView,
      second: secondTooltipView,
    } = this.plugins.tooltipView;

    const { labelsView } = this.plugins;

    if (labelsView.state.isSet) {
      this.view.renderPlugin({
        plugin: 'labels',
        pluginView: labelsView,
      });
    }

    if (firstTooltipView.state.isSet) {
      this._renderTooltip('first');
    }
    if (secondTooltipView.state.isSet) {
      this._renderTooltip('second');
    }
  }

  destroy(): void {
    this.view.destroy();
  }

  updateView(): void {
    const options = this.model.getOptions();

    this.view.setOptions(options);

    this._toggleTooltips(options);
    this._toggleLabels(options);
  }

  showError(errorObject: ErrorObject): void {
    const handler = (message: string): void => { throw new Error(message); };

    new ErrorHandler(handler).throw(errorObject);
  }

  validateNewValue(value: Options['value']): void {
    this.model.refreshValue(value);
  }

  updateValue(): void {
    const options = this.model.getOptions();

    const {
      value, tooltip, range, change,
    } = options;

    const {
      first: firstTooltipView,
      second: secondTooltipView,
    } = this.plugins.tooltipView;

    this.view.updateValue(value);

    if (firstTooltipView.state.isRendered) {
      firstTooltipView.setValue({
        value: range !== true ? (value as number) : (value as number[])[0],
        valueFunction: typeof tooltip === 'function' ? tooltip : null,
      });
    }

    if (secondTooltipView.state.isRendered) {
      secondTooltipView.setValue({
        value: range !== true ? (value as number) : (value as number[])[1],
        valueFunction: typeof tooltip === 'function' ? tooltip : null,
      });
    }

    if (!!change && typeof change === 'function') {
      change(options.value);
    }
  }

  updateHandlePosition(handleCoordinate: number): void {
    this.view.refreshHandlePosition({ currentHandleCoordinate: handleCoordinate });
  }

  private _toggleTooltips(options: Options): void {
    const { range, tooltip } = options;

    if (tooltip) {
      this._setTooltip({ handleNumber: 'first', options });

      if (range === true) {
        this._setTooltip({ handleNumber: 'second', options });
      }
    } else {
      this._destroyTooltip('first');
      this._destroyTooltip('second');
    }
  }

  private _toggleLabels(options: Options): void {
    const { labelsView } = this.plugins;
    const {
      labels, pips, orientation, min, max, step,
    } = options;

    if (labels || pips) {
      const formattedLabels = typeof labels === 'function' ? true : labels;

      const labelsOptions: LabelOptions = {
        labels: formattedLabels, pips, orientation, min, max, step,
      };

      if (typeof labels === 'function') {
        labelsOptions.valueFunction = labels;
      }

      labelsView.setOptions(labelsOptions);

      if (this.view.isRendered()) {
        this.view.renderPlugin({
          plugin: 'labels',
          pluginView: labelsView,
        });
      }
    } else if (labelsView.state.isRendered) {
      this.view.destroyPlugin({
        plugin: 'labels',
        instance: labelsView,
      });
    }
  }

  private _setTooltip({ handleNumber, options }: {
    handleNumber: 'first' | 'second';
    options: Options;
  }): void {
    const { value, orientation, tooltip } = options;
    const valueFunction = typeof tooltip === 'function' ? tooltip : null;

    const tooltipView = this.plugins.tooltipView[handleNumber];

    let tooltipValue: number;
    if (Array.isArray(value)) {
      const [firstValue, secondValue] = value;

      tooltipValue = handleNumber === 'first' ? firstValue : secondValue;
    } else {
      tooltipValue = value;
    }

    tooltipView.setOptions({
      value: tooltipValue,
      orientation,
      valueFunction,
      style: this.pluginStyles && this.pluginStyles.tooltip,
    });

    if (this.view.isRendered()) {
      this._renderTooltip(handleNumber);
    }
  }

  private _renderTooltip(handleNumber: 'first' | 'second'): void {
    const tooltipView = this.plugins.tooltipView[handleNumber];

    this.view.renderPlugin({
      plugin: 'tooltip',
      pluginView: tooltipView,
      number: handleNumber,
    });
  }

  private _destroyTooltip(handleNumber: 'first' | 'second'): void {
    const tooltipView = this.plugins.tooltipView[handleNumber];

    if (!tooltipView.state.isRendered) return;

    this.view.destroyPlugin({
      plugin: 'tooltip',
      instance: tooltipView,
    });
  }
}

export default Presenter;
export {
  CompleteUserOptions,
};
