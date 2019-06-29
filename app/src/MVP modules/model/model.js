// export default function Model() {
//
//     var defaultOp = {
//         min: 0,
//         classes: {
//             "jquery-slider": "",
//             "jquery-slider-range": "",
//             "jquery-slider-handle": ""
//         },
//         max: 100,
//         step: 1,
//         value: 1,
//         orientation: "horizontal",
//         range: false,
//     };
//
//     this.options = defaultOp;
// }


export default function Model( userOptions ) {

    const defaultOptions = {
        min: 0,
        classes: {
            "jquery-slider": "",
            "jquery-slider-range": "",
            "jquery-slider-handle": ""
        },
        max: 100,
        step: 1,
        value: 1,
        orientation: "horizontal",
        range: false,
    };

    let settings = Object.assign({}, defaultOptions);

    if ( userOptions ) {

        settings = $.extend(settings, userOptions);
    }

    Object.defineProperties(this, {

        options : {
            get : function() {
                return settings;
            },
            enumerable : false
        },
    })
}
