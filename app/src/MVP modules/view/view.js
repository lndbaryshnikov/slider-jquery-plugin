export default function View() {

    let html;

    function init() {
        html = $("<div class='jquery-slider'>" +
            "<div class='jquery-slider-range'>" +
            "<div class='jquery-slider-handle'>" +
            "</div></div></div>");
    }

        Object.defineProperties(this, {

            html : {
                get : function() {
                    return html;
                },
                enumerable : false
            }
        });

    init();

}