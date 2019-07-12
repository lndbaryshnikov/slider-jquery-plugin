import {getCorrectOptions} from '../../private/model.private'

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

export function Model( userOptions ) {

    this.options = getCorrectOptions(userOptions, defaultOptions);

}

Object.defineProperties(Model.prototype, {


});


