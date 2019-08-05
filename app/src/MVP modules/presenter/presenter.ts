import {movingHandlerOnAxisX} from "../../functions/private/presenter.private";
import View from '../view/view';
import Model from "../model/model";

class Presenter {
    view: View;

    constructor(view: View) {
        this.view = view;

        const init = () => {
            view.movingHandler = movingHandlerOnAxisX;
        };

        init();
    }

    set model(model: Model) {
           this.view.modelOptions = model.options;
    }
}
export default Presenter;
