import SliderView from './SliderView';
import SliderModel, {Options, UserOptions} from "./SliderModel";

class SliderPresenter {
    private _data: { setUp: boolean; rendered: boolean; } = {
        setUp: false,
        rendered: false
    };

    constructor(private _view: SliderView, private _model: SliderModel) {
        this._model.whenOptionsSet(this.setOptionsToViewCallback());
        this._model.whenOptionsAreIncorrect(this.showErrorMessageCallback());
        this._view.whenValueChanged(this.passValueToModelCallback());
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
            this._view.setOptions(this._model.getOptions() as Options);
        }
    }

    showErrorMessageCallback() {
        return (error: string) => {
            throw new Error(error);
        };
    }

    passValueToModelCallback() {
        return () => {
            this._model.value = this._view.value;
        }
    }
}

export default SliderPresenter;
