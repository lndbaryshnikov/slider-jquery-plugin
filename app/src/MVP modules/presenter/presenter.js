export default function Presenter(_view) {

    const view = _view;

    Object.defineProperties(this, {

        view : {
            get : function() {
                return view;
            },
            enumerable : false
        },
        
        model : {
            set : function(model) {
               view.modelOptions = model.options;
            },
            enumerable : false
        }

    })
}