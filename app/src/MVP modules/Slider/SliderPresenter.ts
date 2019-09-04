import SliderView from './SliderView';
import SliderModel from "./SliderModel";

class SliderPresenter {
    _view: SliderView;
    _model: SliderModel;

    constructor(view: SliderView, model: SliderModel) {
        this._view = view;
        this._model = model;
    }

    get view() {
        return this._view;
    }

    setOptionsToViewCallback() {
        return () => {
            this._view.setOptions(this._model.getOptions(), this._model.getDefaultClasses());
        }
    }

    showErrorMessageCallback() {
        return (error: string) => {
            throw new Error(error);
        };
    }

    passHandlePositionToModelCallback() {
        return () => {
            this._model.handlePositionInPercents = this.view.handlePositionInPercents;
        }
    }
}

export default SliderPresenter;
