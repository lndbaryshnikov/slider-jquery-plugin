import SliderView from './SliderView';
import SliderModel, {UserOptions} from "./SliderModel";

class SliderPresenter {
    private _data: { setUp: boolean; rendered: boolean; } = {
        setUp: false,
        rendered: false
    };

    constructor(private _view: SliderView, private _model: SliderModel) { }

    get view() {
        return this._view;
    }

    get model() {
        return this._model;
    }

    initialize(root: HTMLElement, userOptions?: UserOptions) {
        this.setUp(userOptions);

        this.render(root);
    }

    setUp(userOptions?: UserOptions) {
        if ( !!this._data.setUp ) {
            throw new Error('Slider is already setUp');
        }

        this._model.whenOptionsSet(this.setOptionsToViewCallback());
        this._model.whenOptionsAreIncorrect(this.showErrorMessageCallback());
        this._view.whenHandlePositionChanged(this.passHandlePositionToModelCallback());

        this._view.setUp();

        this._model.setOptions(userOptions);

        this._data.setUp = true;
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
            this._view.setOptions(this._model.getOptions());
        }
    }

    showErrorMessageCallback() {
        return (error: string) => {
            throw new Error(error);
        };
    }

    passHandlePositionToModelCallback() {
        return () => {
            this._model.handlePositionInPercents = this._view.handlePositionInPercents;
        }
    }
}

export default SliderPresenter;
