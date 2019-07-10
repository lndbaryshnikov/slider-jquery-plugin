export default function View() {

    let html;

    function init() {
        html = $("<div><div class='jquery-slider'>" +
            "<div class='jquery-slider-range'>" +
            "<div class='jquery-slider-handle'>" +
            "</div></div></div></div>");
    }

        Object.defineProperties(this, {

            html : {
                get : function() {
                    return html;
                },
                enumerable : false
            },
            
            modelOptions : {
                set : function(modelOptions) {

                    this.classes = modelOptions.classes;


                },
                enumerable : false
            },

            classes : {
                set : function(modelClasses) {

                    for (let key in modelClasses) {

                        html.find('.' + key).addClass(modelClasses[key]);

                    }
                },
                enumerable : false
            }
        });

    init();

}