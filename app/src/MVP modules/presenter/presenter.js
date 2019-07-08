export default function Presenter(_view) {

    Object.defineProperties(this, {

        view : {
            get : function() {
                return _view;
            },
            enumerable : false
        }

    })
}