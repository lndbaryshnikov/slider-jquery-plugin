import {hasAnArrayElements} from '../../functions/common/hasAnArrayElement'
import * as $ from "jquery";
import arrayEquals from "../../functions/common/arrayEquals";
import Observer from "../Observer";

export interface Options {
    min: number,
    classes: {
        "jquery-slider"?: string,
        "jquery-slider-range"?: string,
        "jquery-slider-handle"?: string
    },
    max: number,
    step: number,
    value: number,
    orientation: string,
    range: boolean | string,
}

export interface OptionsDefault {
    min: number,
    classes: {
        "jquery-slider": string,
        "jquery-slider-range": string,
        "jquery-slider-handle": string
    },
    max: number,
    step: number,
    value: number,
    orientation: string,
    range: boolean | string,
}

interface UserOptions {
    min?: number,
    classes?: {
        "jquery-slider"?: string,
        "jquery-slider-range"?: string,
        "jquery-slider-handle"?: string
    },
    max?: number,
    step?: number,
    value?: number,
    orientation?: string,
    range?: boolean | string,
}

interface SliderModel {
    _options: Options;
}

class SliderModel implements SliderModel {
    _options: Options;

    private _defaultOptions: OptionsDefault = {
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

    private _handlePositionInPercents: number;

    private _incorrectOptionsReceivedSubject = new Observer();
    private _optionsSetSubject = new Observer();

    constructor( userOptions?: UserOptions ) {
        this.setOptions(userOptions);
    }

    whenOptionsAreIncorrect(callback: (error: string) => void) {
        this._incorrectOptionsReceivedSubject.addObserver((error: string) => {
            callback(error);
        })
    }

    whenOptionsSet(callback: () => void) {
        this._optionsSetSubject.addObserver(() => {
           callback();
        });
    }

    set handlePositionInPercents(positionInPercents: number) {
        this._handlePositionInPercents = positionInPercents;
    }

    getOptions(): Options {
        return this._options;
    }

    getDefaultClasses(): OptionsDefault["classes"] {
        return this._defaultOptions.classes;
    }

    setOptions(options: UserOptions) {
        let _options = Object.assign({}, this._defaultOptions);

        if ( options ) {
            if(typeof options !== 'object') {
                this._incorrectOptionsReceivedSubject
                    .notifyObservers('Options are incorrect(should be an object)');
            }

            _options = $.extend(_options, options);

            if (!arrayEquals(Object.keys(_options), Object.keys(this._defaultOptions))) {
                this._incorrectOptionsReceivedSubject
                    .notifyObservers('Options are incorrect(should correspond the required format)');
            }

            if (options.classes) {
                if (!hasAnArrayElements(Object.keys(options.classes),
                    Object.keys(this._defaultOptions.classes))) {

                    this._incorrectOptionsReceivedSubject
                        .notifyObservers('Options are incorrect (classes should ' +
                            'correspond the required format)');
                }
            }
        }

        this._options = _options;

        this._optionsSetSubject.notifyObservers();
    }

}

export default SliderModel;


