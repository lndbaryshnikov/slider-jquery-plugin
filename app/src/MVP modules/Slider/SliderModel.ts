// import * as $ from "jquery";

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

interface OptionsDefault {
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

export interface UserOptions {
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

class SliderModel {
    private _options: Options | undefined = undefined;
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

    getOptions(): Options {
        return this._options;
    }

    destroy() {
        this._options = null;
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

    get defaultOptions(): OptionsDefault {
        return this._defaultOptions;
    }

    setOptions(options?: UserOptions) {
        let _options = $.extend(true, {}, this._defaultOptions);

        if ( options ) {
            if(typeof options !== 'object') {
                this._incorrectOptionsReceivedSubject
                    .notifyObservers('Options are incorrect(should be an object)');
            }

            $.extend(true, _options, options);

            if (!arrayEquals(Object.keys(_options), Object.keys(this._defaultOptions))) {
                this._incorrectOptionsReceivedSubject
                    .notifyObservers('Options are incorrect(should correspond the required format)');
            }

            let mainClass: keyof Options['classes'];

            for (mainClass in _options.classes) {
                if ( mainClass.trim() !== mainClass ) {
                    this._incorrectOptionsReceivedSubject
                        .notifyObservers('Options are incorrect(main classes shouldn\'t have extra whitespaces)');
                }
            }

            if (options.classes) {
                if (!arrayEquals(Object.keys(_options.classes),
                    Object.keys(this._defaultOptions.classes))) {

                    this._incorrectOptionsReceivedSubject
                        .notifyObservers('Options are incorrect(classes should ' +
                            'correspond the required format)');
                }
            }
        }

        this._options = _options;

        this._deleteWSFromUserCLasses();

        this._optionsSetSubject.notifyObservers();
    }

    private _deleteWSFromUserCLasses() {
        const _this = this;
        let key: keyof typeof _this._options.classes;

        for ( key in this._options.classes ) {
            if ( this._options.classes[key] !== '' ) {
                this._options.classes[key] = this._options.classes[key]
                    .trim()
                    .replace(/\s+/g, ' ');
            }
        }
    }

}

export default SliderModel;


