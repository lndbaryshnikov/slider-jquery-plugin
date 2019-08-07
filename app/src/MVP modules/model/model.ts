import {getSliderSettings, Options, UserOptions} from '../../functions/private/model.private'

export const defaultOptions: Options = {
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

interface SliderModel {
    options: Options;
}

class Model implements SliderModel {
    options: Options;

    constructor( userOptions?: UserOptions ) {
        this.options = getSliderSettings(userOptions, defaultOptions);
    }

}

export default Model;


