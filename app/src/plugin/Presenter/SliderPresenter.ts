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
    private view: SliderView,
    private model: SliderModel,
  ) {
    this.model.whenOptionsSet(this.makeSetOptionsToViewCallback());
    this.model.whenOptionsAreIncorrect(SliderPresenter.makeShowErrorMessageCallback());
    this.view.whenValueChanged(this.makeValidateValueCallback());
    this.model.whenValueUpdated(this.makeRenderHandlePositionCallback());

    const labelClickHandler = (middleCoordinate: number): void => {
      this.view.refreshValue({ currentHandleCoordinate: middleCoordinate });
    };

    this.plugins.labelsView.whenUserClicksOnLabel(labelClickHandler);
  }

  get sliderView(): SliderView {
    return this.view;
  }

  get sliderModel(): SliderModel {
    return this.model;
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
    this.model.setOptions(options, ...restOptions);

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
    return this.model.getOptions(option, className);
  }

  render(root: HTMLElement): void {
    if (!this.data.setUp) {
      throw new Error("Slider isn't setUp");
    }
    if (this.data.rendered) {
      throw new Error('Slider is already rendered');
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

    this.data.rendered = true;
  }

  destroy(): void {
    if (!this.data.setUp) {
      throw new Error("Slider isn't initialized yet");
    }

    if (this.data.rendered !== false) this.view.cleanDom();

    this.view.destroy();
    this.model.destroy();

    this.data.setUp = false;
    this.data.rendered = false;
  }

  off(): void {
    if (!this.data.rendered) {
      throw new Error("Slider isn't rendered");
    }

    this.view.cleanDom();

    this.data.rendered = false;
  }

  makeSetOptionsToViewCallback() {
    return (): void => {
      const options = this.model.getOptions() as Options;

      this.view.setOptions(options);

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
      this.model.refreshValue(valueData);
    };
  }

  makeRenderHandlePositionCallback() {
    return (): void => {
      const options = this.model.getOptions() as Options;

      const {
        value, tooltip, range, change,
      } = options;

      const {
        first: firstTooltipView,
        second: secondTooltipView,
      } = this.plugins.tooltipView;

      this.view.updateHandlePosition(value);

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
        this.view.renderPlugin({
          plugin: 'tooltip',
          pluginView: firstTooltipView,
          number: 'first',
        });

        if (options.range === true) {
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
        options.range === true && secondTooltipView.state.isRendered
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

export default SliderPresenter;
