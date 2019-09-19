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
    private _options: Options | null = null;
    private _handlePositionInPercents: number;

    private _incorrectOptionsReceivedSubject = new Observer();
    private _optionsSetSubject = new Observer();

    private _classes = {
        slider: {
            main: "jquery-slider" as keyof UserOptions["classes"],
            orientation: (orientation: 'horizontal' | 'vertical') => {
                return `jquery-slider-${orientation}` as keyof Options['classes'];
            },
            complete: (orientation: 'horizontal' | 'vertical') => {
                return `jquery-slider jquery-slider-${orientation}` as keyof Options['classes'];
            },
            horizontal: "jquery-slider-horizontal" as keyof Options["classes"],
            vertical: "jquery-slider-vertical" as keyof Options["classes"]
        },
        range: "jquery-slider-range" as keyof Options["classes"],
        handle: "jquery-slider-handle" as keyof Options["classes"]
    };

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

    static getDefaultOptions(orientation: 'horizontal' | 'vertical' | undefined): Options {

        if ( orientation === undefined ) orientation = 'horizontal';
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

            let _currentOptions: Options;

            if ( this._options ) {
                _currentOptions = $.extend(true, {}, this._options);

                if ( options.orientation && options.orientation !== this._options.orientation ) {
                    this._changeOrientationClass(_currentOptions, 'result', options.orientation);
                }

                this._changeOrientationClass(options, 'user',
                    options.orientation ? options.orientation : this._options.orientation);
            } else {
                _currentOptions = SliderModel.getDefaultOptions(options.orientation);

                this._changeOrientationClass(options, 'user', options.orientation);
            }

            let _defaultOptions: Options | null = $.extend(true, {}, _currentOptions);

            const _options: Options = $.extend(true, _defaultOptions, options);

            _defaultOptions = null;

            if (!arrayEquals(Object.keys(_options), Object.keys(_currentOptions))) {
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
                    Object.keys(_currentOptions.classes))) {

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

    private _changeOrientationClass(options: Options | UserOptions, type: 'user' | 'result',
                                  orientation: 'horizontal' | 'vertical' | undefined): Options | UserOptions {

        if ( orientation !==  undefined && orientation !== 'horizontal' && orientation !== 'vertical' )  {
            this._incorrectOptionsReceivedSubject.notifyObservers('Options are incorrect (for orientation only ' +
                '"vertical" and "horizontal" values are allowed)');
        }
        if ( orientation === undefined ) orientation = 'horizontal';

        if ( type === 'user' && options.classes && (options as UserOptions).classes[this._classes.slider.main] ) {
                options.classes[this._classes.slider.complete(orientation)] =
                    (options as UserOptions).classes[this._classes.slider.main];

            delete (options as UserOptions).classes[this._classes.slider.main];
        }

        if ( type === "result" ) {
            let mainClass: keyof Options['classes'];
            const values: string[] = [];

            for (mainClass in options.classes) {
                values.push(options.classes[mainClass]);

                delete options.classes[mainClass];
            }

            options.classes[this._classes.slider.complete(orientation)] = values[0];
            options.classes[this._classes.range] = values[1];
            options.classes[this._classes.handle] = values[2];
        }

        return options;
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


