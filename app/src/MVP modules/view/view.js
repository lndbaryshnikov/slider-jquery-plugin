export function View() {

    this.html = $("<div><div class='jquery-slider'>" +
        "<div class='jquery-slider-range'>" +
        "<div class='jquery-slider-handle'>" +
        "</div></div></div></div>");
}

Object.defineProperties(View.prototype, {

    modelOptions : {
        set : function(modelOptions) {

            this.classes = modelOptions.classes;

        },
        enumerable : false
    },

    classes : {
        set : function(modelClasses) {

            for (let key in modelClasses) {

                this.html.find('.' + key).addClass(modelClasses[key]);

            }
        },
        enumerable : false
    }
});


