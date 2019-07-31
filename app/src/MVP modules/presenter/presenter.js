import {movingHandlerOnAxisX} from "../../functions/private/presenter.private";

export default function Presenter(_view) {
    this.view = _view;

    const init = () => {
        const view = _view;

        view.movingHandler = movingHandlerOnAxisX;
    };

    init();
}

Object.defineProperties(Presenter.prototype, {

    model : {
        set : function(model) {
           this.view.modelOptions = model.options;
        },
        enumerable : false
    }

});
