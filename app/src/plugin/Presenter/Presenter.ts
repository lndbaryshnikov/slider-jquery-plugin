import MainView, { UserClasses } from '../View/MainView';
import { UserOptions, Options } from '../Model/modelOptions';
import ErrorHandler, { ErrorObject } from '../ErrorHandler/ErrorHandler';
import Model from '../Model/Model';
import LabelsView, { LabelOptions } from '../View/LabelsView';
import TooltipView from '../View/TooltipView';

type CompleteUserOptions = UserOptions & { classes?: UserClasses };

class Presenter {
  private plugins = {
    tooltipView: {
      first: new TooltipView(),
      second: new TooltipView(),
    },
    labelsView: new LabelsView(),
  };

  constructor(
    private view: MainView,
    private model: Model,
  ) {
    this.model.whenOptionsSet(this.updateView.bind(this));
    this.model.whenOptionsIncorrect(this.showError.bind(this));
    this.view.whenValueChanged(this.validateNewValue.bind(this));
    this.model.whenValueUpdated(this.updateValue.bind(this));
    this.plugins.labelsView.whenUserClicksOnLabel(this.updateHandlePosition.bind(this));
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
    const { classes } = options;
    const viewClasses = classes ? { ...classes } : undefined;

    if (classes) {
      delete modelOptions.classes;
    }

    this.view.setClasses(viewClasses);
    this.model.setOptions(modelOptions);
  }

  getOptions(): CompleteUserOptions {
    const modelOptions = this.model.getOptions();
    const viewClasses = this.view.getClasses();

    if (viewClasses) {
      return { ...modelOptions, classes: { ...viewClasses } };
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
      this.view.renderPlugin({
        plugin: 'tooltip',
        pluginView: firstTooltipView,
        number: 'first',
      });
    }

    if (secondTooltipView.state.isSet) {
      this.view.renderPlugin({
        plugin: 'tooltip',
        pluginView: secondTooltipView,
        number: 'second',
      });
    }
  }

  remove(): void {
    this.view.cleanDom();
  }

  updateView(): void {
    const options = this.model.getOptions();

    this.view.setOptions(options);

    this._toggleTooltip(options);
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
      firstTooltipView.setText({
        text: range !== true ? (value as number) : (value as number[])[0],
        func: typeof tooltip === 'function' ? tooltip : null,
      });
    }

    if (secondTooltipView.state.isRendered) {
      secondTooltipView.setText({
        text: range !== true ? (value as number) : (value as number[])[1],
        func: typeof tooltip === 'function' ? tooltip : null,
      });
    }

    if (!!change && typeof change === 'function') {
      change(options.value);
    }
  }

  updateHandlePosition(handleCoordinate: number): void {
    this.view.refreshHandlePosition({ currentHandleCoordinate: handleCoordinate });
  }

  private _toggleTooltip(options: Options): void {
    const {
      first: firstTooltipView,
      second: secondTooltipView,
    } = this.plugins.tooltipView;

    const {
      orientation, value, range, tooltip,
    } = options;

    if (tooltip) {
      if (range !== true) {
        firstTooltipView.setOptions({
          text: value as number,
          orientation,
          func: typeof tooltip === 'function' ? tooltip : null,
        });
      } else {
        const [firstValue, secondValue] = value as number[];

        firstTooltipView.setOptions({
          text: firstValue,
          orientation,
          func: typeof tooltip === 'function' ? tooltip : null,
        });

        secondTooltipView.setOptions({
          text: secondValue,
          orientation,
          func: typeof tooltip === 'function' ? tooltip : null,
        });
      }

      if (this.view.isRendered()) {
        this.view.renderPlugin({
          plugin: 'tooltip',
          pluginView: firstTooltipView,
          number: 'first',
        });

        if (range === true) {
          this.view.renderPlugin({
            plugin: 'tooltip',
            pluginView: secondTooltipView,
            number: 'second',
          });
        }
      }
    } else if (firstTooltipView.state.isRendered) {
      this.view.destroyPlugin({
        plugin: 'tooltip',
        instance: firstTooltipView,
      });

      const isRangeTrueWhenSecondTooltipIsRendered = (
        range === true && secondTooltipView.state.isRendered
      );

      if (isRangeTrueWhenSecondTooltipIsRendered) {
        this.view.destroyPlugin({
          plugin: 'tooltip',
          instance: secondTooltipView,
        });
      }
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
        labelsOptions.valueFunc = labels;
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
}

export default Presenter;
export {
  CompleteUserOptions,
};
