import SliderTooltipView from "../SliderTooltipView";
import SliderLabelsView, {LabelOptions} from "../SliderLabelsView";
import SliderPluginsFactory from "../SliderPluginsFactory";
import SliderView from "./SliderView";
import SliderModel, {Options, UserOptions} from "./SliderModel";

class SliderPresenter {
    private _data: { setUp: boolean; rendered: boolean } = {
        setUp: false,
        rendered: false
    };

    private _pluginsFactory = new SliderPluginsFactory();

    private _plugins = {
        tooltipView: {
            first: this._pluginsFactory.createView("tooltip") as SliderTooltipView,
            second: this._pluginsFactory.createView("tooltip") as SliderTooltipView,
        },
        labelsView: this._pluginsFactory.createView("labels") as SliderLabelsView
    };

    constructor(private _view: SliderView, private _model: SliderModel) {
        this._model.whenOptionsSet(this.setOptionsToViewCallback());
        this._model.whenOptionsAreIncorrect(this.showErrorMessageCallback());
        this._view.whenValueChanged(this.validateValueCallback());
        this._model.whenValueUpdated(this.renderHandlePositionCallback());

        this._plugins.labelsView.whenUserClicksOnLabel((middleCoordinate: number) => {
            this._view.refreshValue(middleCoordinate);
        });
    }

    get view(): SliderView {
        return this._view;
    }

    get model(): SliderModel {
        return this._model;
    }

    initialize(root: HTMLElement, userOptions?: UserOptions): void {
        if ( this._data.rendered ) {
            throw new Error("Slider is already initialized");
        }

        if ( !this._data.setUp ) this.setOptions(userOptions);

        if ( !this._data.rendered ) this.render(root);
    }

    setOptions(
        options?: UserOptions | keyof Options,
        ...restOptions:
            (UserOptions[keyof UserOptions] | UserOptions["classes"][keyof UserOptions["classes"]])[]
    ): void {
        this._model.setOptions(options, ...restOptions);

        this._data.setUp = true;
    }

    getOptions(
        option?: keyof Options,
        className?: keyof UserOptions["classes"]
    ): Options | Options[keyof Options] |
        Options["classes"][keyof Options["classes"]] {
        if ( !this._data.setUp ) {
            throw new Error(SliderModel.optionsErrors.notSet);
        }

        return this._model.getOptions(option, className);
    }

    render(root: HTMLElement): void {
        if ( !this._data.setUp ) {
            throw new Error("Slider isn't setUp");
        }
        if ( this._data.rendered ) {
            throw new Error("Slider is already rendered");
        }

        this._view.render(root);

        const firstTooltipView = this._plugins.tooltipView.first;
        const secondTooltipView = this._plugins.tooltipView.second;
        const labelsView = this._plugins.labelsView;

        if ( labelsView.state.isSet ) {
            this._view.renderPlugin("labels", labelsView);
        }

        if ( firstTooltipView.state.isSet ) {
            this._view.renderPlugin("tooltip", firstTooltipView, "first");
        }

        if ( secondTooltipView.state.isSet ) {
            this._view.renderPlugin("tooltip", secondTooltipView, "second");
        }

        this._data.rendered = true;
    }

    destroy(): void {
        if ( !this._data.setUp ) {
            throw new Error("Slider isn't initialized yet");
        }

        if ( this._data.rendered !== false ) this._view.cleanDom();

        this._view.destroy();
        this._model.destroy();

        this._data.setUp = false;
        this._data.rendered = false;
    }

    off(): void {
        if ( !this._data.rendered ) {
            throw new Error("Slider isn't rendered");
        }

        this._view.cleanDom();

        this._data.rendered = false;
    }

    setOptionsToViewCallback() {
        return (): void => {
            const options = this._model.getOptions() as Options;

            this._view.setOptions(options);

            this._toggleTooltip(options);
            this._toggleLabels(options);
        }
    }

    showErrorMessageCallback() {
        return (error: string): void => {
            throw new Error(error);
        };
    }

    validateValueCallback() {
        return (valueData: [number, "first" | "second"]): void => {
            this._model.refreshValue(valueData);
        }
    }

    renderHandlePositionCallback() {
        return (): void => {
            const options = this._model.getOptions() as Options;

            const value = options.value;
            const tooltip = options.tooltip;
            const range = options.range;
            const change = options.change;

            const firstTooltipView = this._plugins.tooltipView.first;
            const secondTooltipView = this._plugins.tooltipView.second;

            this._view.updateHandlePosition(value);

            if ( firstTooltipView.state.isRendered ) {
                firstTooltipView.setText(range !== true ? value as number : (value as number[])[0],
                    typeof tooltip === "function" ? tooltip : null
                );
            }

            if ( secondTooltipView.state.isRendered ) {
                secondTooltipView.setText(range !== true ? value as number : (value as number[])[1],
                    typeof tooltip === "function" ? tooltip : null
                );
            }

            if ( !!change && typeof change === "function" ) {
                change(options.value);
            }
        }
    }

    private _toggleTooltip(options: Options): void {
        const firstTooltipView = this._plugins.tooltipView.first;
        const secondTooltipView = this._plugins.tooltipView.second;

        if ( options.tooltip ) {
            if ( options.range !== true ) {
                firstTooltipView.setOptions((options.value as number), options.orientation,
                    typeof options.tooltip === "function" ? options.tooltip : null);
            } else {
                firstTooltipView.setOptions((options.value as number[])[0], options.orientation,
                    typeof options.tooltip === "function" ? options.tooltip : null);

                secondTooltipView.setOptions((options.value as number[])[1], options.orientation,
                    typeof options.tooltip === "function" ? options.tooltip : null);
            }

            if ( this._data.rendered ) {
                this._view.renderPlugin("tooltip", firstTooltipView, "first");

                if ( options.range === true ) {
                    this._view.renderPlugin("tooltip", secondTooltipView, "second");
                }
            }

        } else if ( firstTooltipView.state.isRendered ) {
            this._view.destroyPlugin("tooltip", firstTooltipView);

            if ( options.range === true && secondTooltipView.state.isRendered ) {
                this._view.destroyPlugin("tooltip", secondTooltipView);
            }
        }
    }

    private _toggleLabels(options: Options): void {
        const labelsView = this._plugins.labelsView;

        if ( options.labels || options.pips ) {
            const labels = typeof options.labels === "function" ? true : options.labels;

            const labelsOptions: LabelOptions = {
                labels: labels,
                pips: options.pips,
                orientation: options.orientation,
                min: options.min,
                max: options.max,
                step: options.step,
            };

            if ( typeof options.labels === "function" ) {
                labelsOptions.valueFunc = options.labels;
            }

            labelsView.setOptions(labelsOptions);


            if ( this._data.rendered ) this._view.renderPlugin("labels", labelsView);
        } else if ( labelsView.state.isRendered ) {
            this._view.destroyPlugin("labels", labelsView);
        }
    }
}

export default SliderPresenter;
