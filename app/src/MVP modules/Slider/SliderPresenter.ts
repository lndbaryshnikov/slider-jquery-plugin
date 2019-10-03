import SliderView from './SliderView';
import SliderModel, {Options, UserOptions} from "./SliderModel";
import SliderTooltipView from "../SliderTooltipView";

class SliderPresenter {
    private _data: { setUp: boolean; rendered: boolean; } = {
        setUp: false,
        rendered: false
    };

    private _tooltipView: SliderTooltipView = new SliderTooltipView();

    constructor(private _view: SliderView, private _model: SliderModel) {
        this._model.whenOptionsSet(this.setOptionsToViewCallback());
        this._model.whenOptionsAreIncorrect(this.showErrorMessageCallback());

        this._view.whenValueChanged(this.validateValueCallback());

        this._model.whenValueUpdated(this.renderHandlePositionCallback());
    }

    get view() {
        return this._view;
    }

    get model() {
        return this._model;
    }

    initialize(root: HTMLElement, userOptions?: UserOptions) {
        if ( !!this._data.rendered ) {
            throw new Error('Slider is already initialized');
        }

        if ( !this._data.setUp ) this.setOptions(userOptions);

        if ( !this._data.rendered ) this.render(root);
    }

    setOptions(options?: UserOptions | keyof Options, ...restOptions:
        (UserOptions[keyof UserOptions] | UserOptions["classes"][keyof UserOptions["classes"]])[]) {
        this._model.setOptions(options, ...restOptions);

        this._data.setUp = true;
    }

    getOptions(option?: keyof Options, className?: keyof UserOptions["classes"]) {
        if ( !this._data.setUp ) {
            throw new Error(SliderModel.optionsErrors.notSet);
        }

        return this._model.getOptions(option, className);
    }

    render(root: HTMLElement) {
        if ( !this._data.setUp ) {
            throw new Error('Slider isn\'t setUp');
        }
        if ( !!this._data.rendered ) {
            throw new Error('Slider is already rendered');
        }

        this._view.render(root);

        this._data.rendered = true;
    }

    destroy(): void {
        if ( !this._data.setUp ) {
            throw new Error('Slider isn\'t initialized yet');
        }

        if ( this._data.rendered !== false ) this._view.cleanDom();

        this._view.destroy();
        this._model.destroy();

        this._data.setUp = false;
        this._data.rendered = false;
    }

    off() {
        if ( !this._data.rendered ) {
            throw new Error('Slider isn\'t rendered');
        }

        this._view.cleanDom();

        this._data.rendered = false;
    }

    setOptionsToViewCallback() {
        return () => {
            const options = this._model.getOptions() as Options;

            let tooltip: SliderTooltipView | null = null;

            if ( options.tooltip ) {
                this._tooltipView.init(options.value, options.orientation,
                    typeof options.tooltip === "function" ? options.tooltip : null);

                tooltip = this._tooltipView;
            } else if ( this._tooltipView.state.isRendered ) this._tooltipView.destroy();

            this._view.setOptions(options, tooltip);
        }
    }

    showErrorMessageCallback() {
        return (error: string) => {
            throw new Error(error);
        };
    }

    validateValueCallback() {
        return (value: Options["value"]) => {
            this._model.refreshValue(value);
        }
    }

    renderHandlePositionCallback() {
        return () => {
            const value = (this._model.getOptions() as Options).value;
            const tooltip = (this._model.getOptions() as Options).tooltip;

            this._view.updateHandlePosition(value);
            if ( this._tooltipView.state.isRendered ) {
                this._tooltipView.setText(value,
                    typeof tooltip === "function" ? tooltip : null
                );
            }
        }
    }
}

export default SliderPresenter;
