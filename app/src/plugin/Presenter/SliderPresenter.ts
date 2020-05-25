import TooltipView from '../View/TooltipView';
import LabelsView, {
  LabelOptions,
} from '../View/LabelsView';
import PluginsFactory from '../pluginsFactory/PluginsFactory';
import SliderView from '../View/SliderView';
import SliderModel, { Options, UserOptions } from '../Model/SliderModel';

class SliderPresenter {
  private data: { setUp: boolean; rendered: boolean } = {
    setUp: false,
    rendered: false,
  };

  private pluginsFactory = new PluginsFactory();

  private plugins = {
    tooltipView: {
      first: this.pluginsFactory.createView('tooltip') as TooltipView,
      second: this.pluginsFactory.createView('tooltip') as TooltipView,
    },
    labelsView: this.pluginsFactory.createView('labels') as LabelsView,
  };

  constructor(
    private viewInstance: SliderView,
    private modelInstance: SliderModel,
  ) {
    this.modelInstance.whenOptionsSet(this.makeSetOptionsToViewCallback());
    this.modelInstance.whenOptionsAreIncorrect(
      SliderPresenter.makeShowErrorMessageCallback(),
    );
    this.viewInstance.whenValueChanged(this.makeValidateValueCallback());
    this.modelInstance.whenValueUpdated(
      this.makeRenderHandlePositionCallback(),
    );

    const labelClickHandler = (middleCoordinate: number): void => {
      this.viewInstance.refreshValue({ currentHandleCoordinate: middleCoordinate });
    };

    this.plugins.labelsView.whenUserClicksOnLabel(labelClickHandler);
  }

  get view(): SliderView {
    return this.viewInstance;
  }

  get model(): SliderModel {
    return this.modelInstance;
  }

  initialize(root: HTMLElement, userOptions?: UserOptions): void {
    if (this.data.rendered) {
      throw new Error('Slider is already initialized');
    }

    if (!this.data.setUp) this.setOptions(userOptions);

    if (!this.data.rendered) this.render(root);
  }

  setOptions(
    options?: UserOptions | keyof Options,
    ...restOptions: (
      | UserOptions[keyof UserOptions]
      | UserOptions['classes'][keyof UserOptions['classes']]
    )[]
  ): void {
    this.modelInstance.setOptions(options, ...restOptions);

    this.data.setUp = true;
  }

  getOptions(
    option?: keyof Options,
    className?: keyof UserOptions['classes'],
  ):
    | Options
    | Options[keyof Options]
    | Options['classes'][keyof Options['classes']]
    | void {
    if (!this.data.setUp) {
      throw new Error(SliderModel.optionsErrors.notSet);
    }

    return this.modelInstance.getOptions(option, className);
  }

  render(root: HTMLElement): void {
    if (!this.data.setUp) {
      throw new Error("Slider isn't setUp");
    }
    if (this.data.rendered) {
      throw new Error('Slider is already rendered');
    }

    this.viewInstance.render(root);

    const {
      first: firstTooltipView,
      second: secondTooltipView,
    } = this.plugins.tooltipView;

    const { labelsView } = this.plugins;

    if (labelsView.state.isSet) {
      this.viewInstance.renderPlugin({
        plugin: 'labels',
        pluginView: labelsView,
      });
    }

    if (firstTooltipView.state.isSet) {
      this.viewInstance.renderPlugin({
        plugin: 'tooltip',
        pluginView: firstTooltipView,
        number: 'first',
      });
    }

    if (secondTooltipView.state.isSet) {
      this.viewInstance.renderPlugin({
        plugin: 'tooltip',
        pluginView: secondTooltipView,
        number: 'second',
      });
    }

    this.data.rendered = true;
  }

  destroy(): void {
    if (!this.data.setUp) {
      throw new Error("Slider isn't initialized yet");
    }

    if (this.data.rendered !== false) this.viewInstance.cleanDom();

    this.viewInstance.destroy();
    this.modelInstance.destroy();

    this.data.setUp = false;
    this.data.rendered = false;
  }

  off(): void {
    if (!this.data.rendered) {
      throw new Error("Slider isn't rendered");
    }

    this.viewInstance.cleanDom();

    this.data.rendered = false;
  }

  makeSetOptionsToViewCallback() {
    return (): void => {
      const options = this.modelInstance.getOptions() as Options;

      this.viewInstance.setOptions(options);

      this._toggleTooltip(options);
      this._toggleLabels(options);
    };
  }

  static makeShowErrorMessageCallback() {
    return (error: string): void => {
      throw new Error(error);
    };
  }

  makeValidateValueCallback() {
    return (valueData: [number, 'first' | 'second']): void => {
      this.modelInstance.refreshValue(valueData);
    };
  }

  makeRenderHandlePositionCallback() {
    return (): void => {
      const options = this.modelInstance.getOptions() as Options;

      const {
        value, tooltip, range, change,
      } = options;

      const {
        first: firstTooltipView,
        second: secondTooltipView,
      } = this.plugins.tooltipView;

      this.viewInstance.updateHandlePosition(value);

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
    };
  }

  private _toggleTooltip(options: Options): void {
    const {
      first: firstTooltipView,
      second: secondTooltipView,
    } = this.plugins.tooltipView;

    if (options.tooltip) {
      if (options.range !== true) {
        firstTooltipView.setOptions({
          text: options.value as number,
          orientation: options.orientation,
          func: typeof options.tooltip === 'function' ? options.tooltip : null,
        });
      } else {
        firstTooltipView.setOptions({
          text: (options.value as number[])[0],
          orientation: options.orientation,
          func: typeof options.tooltip === 'function' ? options.tooltip : null,
        });

        secondTooltipView.setOptions({
          text: (options.value as number[])[1],
          orientation: options.orientation,
          func: typeof options.tooltip === 'function' ? options.tooltip : null,
        });
      }

      if (this.data.rendered) {
        this.viewInstance.renderPlugin({
          plugin: 'tooltip',
          pluginView: firstTooltipView,
          number: 'first',
        });

        if (options.range === true) {
          this.viewInstance.renderPlugin({
            plugin: 'tooltip',
            pluginView: secondTooltipView,
            number: 'second',
          });
        }
      }
    } else if (firstTooltipView.state.isRendered) {
      this.viewInstance.destroyPlugin({
        plugin: 'tooltip',
        instance: firstTooltipView,
      });

      const isRangeTrueWhenSecondTooltipIsRendered = (
        options.range === true && secondTooltipView.state.isRendered
      );

      if (isRangeTrueWhenSecondTooltipIsRendered) {
        this.viewInstance.destroyPlugin({
          plugin: 'tooltip',
          instance: secondTooltipView,
        });
      }
    }
  }

  private _toggleLabels(options: Options): void {
    const { labelsView } = this.plugins;

    if (options.labels || options.pips) {
      const {
        pips, orientation, min, max, step, labels,
      } = options;

      const formattedLabels = typeof labels === 'function' ? true : labels;

      const labelsOptions: LabelOptions = {
        labels: formattedLabels, pips, orientation, min, max, step,
      };

      if (typeof labels === 'function') {
        labelsOptions.valueFunc = labels;
      }

      labelsView.setOptions(labelsOptions);

      if (this.data.rendered) {
        this.viewInstance.renderPlugin({
          plugin: 'labels',
          pluginView: labelsView,
        });
      }
    } else if (labelsView.state.isRendered) {
      this.viewInstance.destroyPlugin({
        plugin: 'labels',
        instance: labelsView,
      });
    }
  }
}

export default SliderPresenter;
