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

export type Options = {
    min: number,
    max: number,
    step: number,
    value: number,
    orientation: 'horizontal' | 'vertical',
    range: 'min' | 'max' | boolean,

    classes: HorizontalClasses | VerticalClasses
};

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

export type RestOptionsToSet = (UserOptions[keyof UserOptions] | UserOptions["classes"][keyof UserOptions["classes"]]);

class SliderModel {
    private _options: Options | null = null;
    private _handlePositionInPercents: number;

    private _incorrectOptionsReceivedSubject = new Observer();
    private _incorrectOptionRequested = new Observer();
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

    getOptions(option?: keyof Options, className?: keyof UserOptions['classes']): Options | Options[keyof Options] |
        Options["classes"][keyof Options["classes"]] {

        if ( !this._options ) {
            this._incorrectOptionRequested.notifyObservers('Options are not set');
        }
        if ( !option && !className ) return this._options as Options;

        if ( option ) {
            if ( !!option && !(option in this._options) ) {
                this._incorrectOptionRequested.notifyObservers(`Option "${option}" doesn't exist`);

                return;
            }

            const userClasses: (keyof UserOptions['classes'])[] = [
                this._classes.slider.main,
                this._classes.range,
                this._classes.handle
            ];

            if ( className && !userClasses.includes(className) ) {
                this._incorrectOptionRequested.notifyObservers(`Class "${className}" does not exist`);

                return;
            }

            if ( option && className && option !== 'classes') {
                this._incorrectOptionRequested.notifyObservers('Only option "classes" contains classes');

                return;
            }

            if (option && !className) {
                return this._options[option] as Options[keyof Options];
            } else {
                if ( className === this._classes.slider.main ) {
                    className = this._classes.slider.complete(this._options.orientation);
                }
                return this._options.classes[className as keyof Options["classes"]] as
                    Options["classes"][keyof Options["classes"]];
            }
        }
    }

    destroy() {
        this._options = null;
    }

    whenOptionsAreIncorrect(callback: (error: string) => void) {
        this._incorrectOptionsReceivedSubject.addObserver((error: string) => {
            callback(error);
        });
    }

    whenIncorrectOptionRequested(callback: (error: string) => void) {
        this._incorrectOptionRequested.addObserver((error: string) => {
           callback(error);
        });
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

    setOptions(options?: UserOptions | keyof Options, ...restOptions: RestOptionsToSet[]) {
        if ( restOptions.length !== 0 && typeof options === "string" ) {
            if ( !this._options ) {
                this._incorrectOptionsReceivedSubject
                    .notifyObservers('Options are not set (to set options pass options object)');

                return;
            }

            const optionsCopy = $.extend(true, {}, this._options);

            if ( !((options as keyof Options) in optionsCopy) ) {
                    this._incorrectOptionsReceivedSubject
                        .notifyObservers(`Option "${options}" doesn't exist`);

                    return;
            }

            if ( restOptions.length === 1 ) {
                if (options === "classes" && typeof restOptions[0] === "object") {
                    const classes = restOptions[0] as UserOptions["classes"];

                    if (this._classes.slider.main in classes) {
                        classes[this._classes.slider.complete(this._options.orientation)] =
                            classes[this._classes.slider.main];

                        delete classes[this._classes.slider.main];
                    }

                    $.extend(optionsCopy.classes, classes);
                } else if ( options === "orientation" ) {
                    if ( restOptions[0] !== optionsCopy.orientation ) {
                        this._changeOrientationClass(optionsCopy,
                            "result",
                            restOptions[0] as Options["orientation"]
                        );

                        optionsCopy[options] = restOptions[0] as Options["orientation"];
                    }
                } else {
                    let optionObj: any = {};
                    optionObj[options] = restOptions[0];

                    $.extend(optionsCopy, optionObj as Options);
                }
            }

            if ( restOptions.length === 2 ) {
                if ( options !== 'classes' ) {
                    this._incorrectOptionsReceivedSubject
                        .notifyObservers('Only option "classes" can have two extra arguments');

                    return;
                }

                const classNames = [
                    this._classes.slider.main,
                    this._classes.range,
                    this._classes.handle
                ];

                if ( typeof restOptions[0] !== 'string' ||
                    !classNames.includes(restOptions[0] as keyof UserOptions["classes"]) ) {

                    this._incorrectOptionsReceivedSubject
                        .notifyObservers(`Class '${restOptions[0]}' doesn't exist`);

                    return;
                }

                let className: keyof Options['classes'];

                if ( restOptions[0] === this._classes.slider.main ) {
                    className = this._classes.slider.complete(this._options.orientation);
                } else {
                    className = restOptions[0] as keyof Options["classes"];
                }

                if ( typeof restOptions[1] !== "string" ) {
                    this._incorrectOptionsReceivedSubject
                        .notifyObservers('Class is incorrect (should be a string)');

                    return;
                }

                optionsCopy[options as "classes"][className] = restOptions[1] as keyof Options["classes"];
            }

            if ( !this._checkOptions(optionsCopy) ) return;

            this._options = optionsCopy;

        } else if ( typeof options === "object" && restOptions.length === 0 ) {
            let _currentOptions: Options;

            if ( this._options ) {
                _currentOptions = $.extend(true, {}, this._options);

                if ( (options as Options).orientation && (options as UserOptions).orientation !== this._options.orientation ) {
                    this._changeOrientationClass(_currentOptions, 'result', (options as UserOptions).orientation);
                }

                this._changeOrientationClass(options as UserOptions, 'user',
                    (options as UserOptions).orientation ? (options as UserOptions).orientation :
                        this._options.orientation);
            } else {
                _currentOptions = SliderModel.getDefaultOptions((options as UserOptions).orientation);

                this._changeOrientationClass(options as UserOptions, 'user', (options as UserOptions).orientation);
            }

            let _defaultOptions: Options | null = $.extend(true, {}, _currentOptions);

            const _options: Options = $.extend(true, _defaultOptions, options);

            _defaultOptions = null;

            if ( !this._checkOptions(_options) ) return;

            this._options = _options;

            this._deleteWSFromUserCLasses();

        } else if ( !options && restOptions.length === 0 ) {
            if ( this._options ) {
                this._incorrectOptionsReceivedSubject
                    .notifyObservers("Options are already set " +
                        "(to change - provide options)");

                return;
            }
            this._options = SliderModel.getDefaultOptions('horizontal');
        } else {
            this._incorrectOptionsReceivedSubject
                .notifyObservers('Incorrect options (should be object or key - value pairs)');

            return;
        }

        this._optionsSetSubject.notifyObservers();
    }

    private _checkOptions(options: Options): boolean {
        const defaults = SliderModel.getDefaultOptions(options.orientation);

        if (!arrayEquals(Object.keys(options), Object.keys(defaults))) {
            this._incorrectOptionsReceivedSubject
                .notifyObservers('Options are incorrect(should correspond the required format)');

            return false;
        }

        let mainClass: keyof typeof  options.classes;

        for (mainClass in options.classes) {
            if ( mainClass.trim() !== mainClass ) {
                this._incorrectOptionsReceivedSubject
                    .notifyObservers('Options are incorrect(main classes shouldn\'t have extra whitespaces)');

                return false;
            }
        }

        if (!arrayEquals(Object.keys(options.classes),
            Object.keys(defaults.classes))) {

            this._incorrectOptionsReceivedSubject
                .notifyObservers('Options are incorrect(classes should ' +
                    'correspond the required format)');

            return false;
        }

        for (mainClass in options.classes) {
            if ( typeof options.classes[mainClass] !== "string" ) {
                this._incorrectOptionsReceivedSubject
                    .notifyObservers("Options are incorrect (classes should be typeof string)");

                return false;
            }
        }

        const checkType = (type: 'string' | 'number' | 'boolean', options: Options, ...params: (keyof Options)[]) => {
            for ( let param of params ) {
                if ( typeof options[param] !== type ) {
                    this._incorrectOptionsReceivedSubject
                        .notifyObservers(`Options are incorrect (option '${param}' should be of type '${type}')`);

                    return false;
                }
            }

            return true;
        };

        if ( !checkType("number", options, "min", "max", "step", "value") ) {
            return false;
        }

        if ( options.orientation !== "horizontal" && options.orientation !== "vertical" ){
            this._incorrectOptionsReceivedSubject
                .notifyObservers("Options are incorrect (for orientation only " +
                    "'vertical' and 'horizontal' values are allowed)");

            return false;
        }

        if ( options.range !== "min" && options.range !== "max" && typeof options.range !== "boolean" ) {
            this._incorrectOptionsReceivedSubject
                .notifyObservers("Options are incorrect (Option 'range' " +
                    "can only be 'min', 'max' or typeof 'boolean')");

            return false;
        }

        return true;
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


