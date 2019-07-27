import {getSliderSettings} from '../../functions/private/model.private'

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

export default function Model( userOptions ) {

    this.options = getSliderSettings(userOptions, defaultOptions);

}

Object.defineProperties(Model.prototype, {


});


