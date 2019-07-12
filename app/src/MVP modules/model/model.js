export const defaultOptions = {
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

import {getCorrectOptions} from '../../private.functions/model.private'


export function Model( userOptions ) {

    const settings = getCorrectOptions(userOptions, defaultOptions);

    Object.defineProperties(this, {

        options : {
            get : function() {
                return settings;
            },
            enumerable : false
        },

    })

}
