


export default function Presenter(_view) {

    this.view = _view;
}

Object.defineProperties(Presenter.prototype, {

    model : {
        set : function(model) {
           this.view.modelOptions = model.options;
        },
        enumerable : false
    }

});
