import {countHandleCoordX, countShift, Shift} from "../../functions/private/presenter.private";
import View from '../view/view';
import Model from "../model/model";
import {Options} from "../../functions/private/model.private";
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;

class Presenter {
    view: View;
    model: Model;
    modelOptions: Options;

    constructor(view: View, model: Model) {
        this.view = view;
        this.model = model;

        this.view.modelOptions = this.model.options;
        this.view.whenUserMovesHandler = this.countHandleCoords;
    }

    countHandleCoords = (handle: HTMLElement, horizontalArea: HTMLElement, handleShift: Shift, mousemoveEvent: MouseMoveEvent): number => {
        return countHandleCoordX(horizontalArea, handle, mousemoveEvent, handleShift);
    }
}

export default Presenter;
