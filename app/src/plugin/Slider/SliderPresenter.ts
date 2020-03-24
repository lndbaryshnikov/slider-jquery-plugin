import SliderTooltipView from '../SliderTooltipView/SliderTooltipView';
import SliderLabelsView, { LabelOptions } from '../SliderLabelsView/SliderLabelsView';
import SliderPluginsFactory from '../SliderPluginsFactory/SliderPluginsFactory';
import SliderView from './SliderView';
import SliderModel, { Options, UserOptions } from './SliderModel';

class SliderPresenter {
  private data: { setUp: boolean; rendered: boolean } = {
    setUp: false,
    rendered: false,
  };

  private pluginsFactory = new SliderPluginsFactory();

  private plugins = {
    tooltipView: {
      first: this.pluginsFactory.createView('tooltip') as SliderTooltipView,
      second: this.pluginsFactory.createView('tooltip') as SliderTooltipView,
    },
    labelsView: this.pluginsFactory.createView('labels') as SliderLabelsView,
  };

  constructor(private viewInstance: SliderView, private modelInstance: SliderModel) {
    this.modelInstance.whenOptionsSet(this.setOptionsToViewCallback());
    this.modelInstance.whenOptionsAreIncorrect(SliderPresenter.showErrorMessageCallback());
    this.viewInstance.whenValueChanged(this.validateValueCallback());
    this.modelInstance.whenValueUpdated(this.renderHandlePositionCallback());

    this.plugins.labelsView.whenUserClicksOnLabel((middleCoordinate: number) => {
      this.viewInstance.refreshValue(middleCoordinate);
    });
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
    ...restOptions:
    (UserOptions[keyof UserOptions] | UserOptions['classes'][keyof UserOptions['classes']])[]
  ): void {
    this.modelInstance.setOptions(options, ...restOptions);

    this.data.setUp = true;
  }

  getOptions(
    option?: keyof Options,
    className?: keyof UserOptions['classes'],
  ): Options | Options[keyof Options] |
    Options['classes'][keyof Options['classes']] {
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

    const firstTooltipView = this.plugins.tooltipView.first;
    const secondTooltipView = this.plugins.tooltipView.second;
    const { labelsView } = this.plugins;

    if (labelsView.state.isSet) {
      this.viewInstance.renderPlugin('labels', labelsView);
    }

    if (firstTooltipView.state.isSet) {
      this.viewInstance.renderPlugin('tooltip', firstTooltipView, 'first');
    }

    if (secondTooltipView.state.isSet) {
      this.viewInstance.renderPlugin('tooltip', secondTooltipView, 'second');
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

  setOptionsToViewCallback() {
    return (): void => {
      const options = this.modelInstance.getOptions() as Options;

      this.viewInstance.setOptions(options);

      this._toggleTooltip(options);
      this._toggleLabels(options);
    };
  }

  static showErrorMessageCallback() {
    return (error: string): void => {
      throw new Error(error);
    };
  }

  validateValueCallback() {
    return (valueData: [number, 'first' | 'second']): void => {
      this.modelInstance.refreshValue(valueData);
    };
  }

  renderHandlePositionCallback() {
    return (): void => {
      const options = this.modelInstance.getOptions() as Options;

      const { value } = options;
      const { tooltip } = options;
      const { range } = options;
      const { change } = options;

      const firstTooltipView = this.plugins.tooltipView.first;
      const secondTooltipView = this.plugins.tooltipView.second;

      this.viewInstance.updateHandlePosition(value);

      if (firstTooltipView.state.isRendered) {
        firstTooltipView.setText(range !== true ? value as number : (value as number[])[0],
          typeof tooltip === 'function' ? tooltip : null);
      }

      if (secondTooltipView.state.isRendered) {
        secondTooltipView.setText(range !== true ? value as number : (value as number[])[1],
          typeof tooltip === 'function' ? tooltip : null);
      }

      if (!!change && typeof change === 'function') {
        change(options.value);
      }
    };
  }

  private _toggleTooltip(options: Options): void {
    const firstTooltipView = this.plugins.tooltipView.first;
    const secondTooltipView = this.plugins.tooltipView.second;

    if (options.tooltip) {
      if (options.range !== true) {
        firstTooltipView.setOptions((options.value as number), options.orientation,
          typeof options.tooltip === 'function' ? options.tooltip : null);
      } else {
        firstTooltipView.setOptions((options.value as number[])[0], options.orientation,
          typeof options.tooltip === 'function' ? options.tooltip : null);

        secondTooltipView.setOptions((options.value as number[])[1], options.orientation,
          typeof options.tooltip === 'function' ? options.tooltip : null);
      }

      if (this.data.rendered) {
        this.viewInstance.renderPlugin('tooltip', firstTooltipView, 'first');

        if (options.range === true) {
          this.viewInstance.renderPlugin('tooltip', secondTooltipView, 'second');
        }
      }
    } else if (firstTooltipView.state.isRendered) {
      this.viewInstance.destroyPlugin('tooltip', firstTooltipView);

      if (options.range === true && secondTooltipView.state.isRendered) {
        this.viewInstance.destroyPlugin('tooltip', secondTooltipView);
      }
    }
  }

  private _toggleLabels(options: Options): void {
    const { labelsView } = this.plugins;

    if (options.labels || options.pips) {
      const labels = typeof options.labels === 'function' ? true : options.labels;

      const labelsOptions: LabelOptions = {
        labels,
        pips: options.pips,
        orientation: options.orientation,
        min: options.min,
        max: options.max,
        step: options.step,
      };

      if (typeof options.labels === 'function') {
        labelsOptions.valueFunc = options.labels;
      }

      labelsView.setOptions(labelsOptions);


      if (this.data.rendered) this.viewInstance.renderPlugin('labels', labelsView);
    } else if (labelsView.state.isRendered) {
      this.viewInstance.destroyPlugin('labels', labelsView);
    }
  }
}

export default SliderPresenter;
