// import * as $ from "jquery";

import arrayEquals from "../../functions/common/arrayEquals";
import Observer from "../Observer";

type Optional<T> = {
    [O in keyof T]?: T[O]
};

export type HorizontalClasses = {
    "jquery-slider jquery-slider-horizontal": string,
    "jquery-slider-range": string,
    "jquery-slider-handle": string
}

export type VerticalClasses = {
    "jquery-slider jquery-slider-vertical": string;
    "jquery-slider-range": string,
    "jquery-slider-handle": string
}
// type Classes = {
//     "jquery-slider jquery-slider-horizontal": string;
//     "jquery-slider-range": string,
//     "jquery-slider-handle": string
// } | {
//     "jquery-slider jquery-slider-vertical": string;
//     "jquery-slider-range": string,
//     "jquery-slider-handle": string
// }

export type Options = {
    min: number,
    max: number,
    step: number,
    value: number,
    orientation: 'horizontal' | 'vertical',
    range: 'min' | 'max' | boolean,

    classes: HorizontalClasses | VerticalClasses
};

// export type OptionsDefault = {
//     min: 0,
//     max: 100,
//     step: 1,
//     value: 0,
//     orientation: 'horizontal' | 'vertical',
//     range: 'min' | 'max' | boolean,
//
//     classes: HorizontalClasses | VerticalClasses
// };

export type UserOptions = {
    min?: number,
    max?: number,
    step?: number,
    value?: number,
    orientation?: 'horizontal' | 'vertical',
    range?: 'min' | 'max' | boolean,
    classes?: {
        "jquery-slider"?: string,
        "jquery-slider-range"?: string,
        "jquery-slider-handle"?: string
    }
};

class SliderModel {
    private _options: Options | undefined = undefined;
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

    static getDefaultOptions(orientation: 'horizontal' | 'vertical'): Options {
        let classes: Options['classes'];

        if ( orientation === 'horizontal' ) {
            classes = {
                "jquery-slider jquery-slider-horizontal": "",
                "jquery-slider-range": "",
                "jquery-slider-handle": ""
            }
        }
        if ( orientation === 'vertical' ) {
            classes = {
                "jquery-slider jquery-slider-vertical": "",
                "jquery-slider-range": "",
                "jquery-slider-handle": ""
            }
        }

        return {
            min: 0,
            max: 100,
            step: 1,
            value: 0,
            orientation: orientation,
            range: false,
            classes: classes
        };
    };

    setOptions(options?: UserOptions) {
        if ( options ) {
            if ( typeof options !== 'object' ) {
                this._incorrectOptionsReceivedSubject
                    .notifyObservers('Options are incorrect(should be an object)');
            }

            let _defaults: Options;

            if ( !options.orientation ) {
                _defaults = SliderModel.getDefaultOptions('horizontal');
            } else if ( options.orientation === 'vertical' || options.orientation === 'horizontal') {
                _defaults = SliderModel.getDefaultOptions(options.orientation);
            } else {
                this._incorrectOptionsReceivedSubject.notifyObservers('Options are incorrect (for orientation only ' +
                    '"vertical" and "horizontal" values are allowed)');
            }

            if ( options.classes && options.classes["jquery-slider"] ) {
                if ( !options.orientation || options.orientation === 'horizontal' ) {
                    (options.classes as HorizontalClasses)["jquery-slider jquery-slider-horizontal"] =
                        options.classes["jquery-slider"];

                    delete options.classes["jquery-slider"];
                }

                if ( options.orientation === 'vertical' ) {
                    (options.classes as VerticalClasses)["jquery-slider jquery-slider-vertical"] =
                        options.classes["jquery-slider"];

                    delete options.classes["jquery-slider"];
                }
            }
            let _defaultsClone: Options | null = $.extend(true, {}, _defaults);

            const _options: Options = $.extend(true, _defaultsClone, options);

            _defaultsClone = null;

            if (!arrayEquals(Object.keys(_options), Object.keys(_defaults))) {
                this._incorrectOptionsReceivedSubject
                    .notifyObservers('Options are incorrect(should correspond the required format)');
            }

            if (options.classes) {
                let mainClass: keyof typeof  _options.classes;

                for (mainClass in _options.classes) {
                    if ( mainClass.trim() !== mainClass ) {
                        this._incorrectOptionsReceivedSubject
                            .notifyObservers('Options are incorrect(main classes shouldn\'t have extra whitespaces)');
                    }
                }

                if (!arrayEquals(Object.keys(_options.classes),
                    Object.keys(_defaults.classes))) {

                    this._incorrectOptionsReceivedSubject
                        .notifyObservers('Options are incorrect(classes should ' +
                            'correspond the required format)');
                }
            }

            this._options = _options;

            this._deleteWSFromUserCLasses();
        } else {
            this._options = SliderModel.getDefaultOptions('horizontal');
        }

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


