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

export type ValueFunction = (value?: Options["value"]) => string | number;

export type Options = {
    min: number,
    max: number,
    step: number,
    value: number,
    orientation: 'horizontal' | 'vertical',
    range: 'min' | 'max' | boolean,
    tooltip: boolean | ValueFunction,
    animate: "slow" | "fast" | false | number,
    labels: true | false | ValueFunction,
    pips: boolean,

    classes: HorizontalClasses | VerticalClasses
};

export type UserOptions = {
    min?: number,
    max?: number,
    step?: number,
    value?: number,
    orientation?: 'horizontal' | 'vertical',
    range?: 'min' | 'max' | boolean,
    tooltip?: boolean | ValueFunction,
    animate?: "slow" | "fast" | false | number,
    labels?: true | false | ValueFunction,
    pips?: boolean,

    classes?: {
        "jquery-slider"?: string,
        "jquery-slider-range"?: string,
        "jquery-slider-handle"?: string
    }
};

export type RestOptionsToSet = (UserOptions[keyof UserOptions] | UserOptions["classes"][keyof UserOptions["classes"]]);

class SliderModel {
    private _handlePositionInPercents: number;

    private _incorrectOptionsReceivedSubject = new Observer();
    private _optionsSetSubject = new Observer();
    private _valueUpdatedSubject = new Observer();

    private _options: Options | null = null;

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

    private static _optionsErrors = {
        notSet: "Options are not set (to set options pass options object)",
        alreadySet: "Options are already set (to change - provide options)",
        incorrectOptions: 'Incorrect options (should be object or key - value pairs)',
        incorrectOptionsObject: "Options are incorrect (should correspond the required format)",
        options: {
            notExisting: (option: string) => `Option "${option}" doesn't exist`,
            incorrectType: (option: string, type: string) => {
                return `Options are incorrect (option '${option}' should be of type '${type}')`
            },
        },
        classes: {
            notExisting: (className: string) => `Class "${className}" does not exist`,
            contains: "Only option 'classes' contains classes",
            twoExtra: "Only option 'classes' can have two extra arguments",
            customIsNotString: "Class is incorrect (should be a string)",
            extraWs: "Options are incorrect (main classes shouldn't have extra whitespaces)",
            incorrectFormat: "Options are incorrect (classes should correspond the required format)"
        },
        value: {
            beyond: "Options are incorrect ('value' cannot go beyond 'min' and 'max')"
        },
        minAndMax: {
            lessOrMore: (option: string, lessOrMore: "less" | "more") => {
                return `Options are incorrect (option '${option}' cannot be ${lessOrMore} than 'value')`;
            }
        },
        orientation: {
            incorrect: "Options are incorrect (for orientation only 'vertical' and 'horizontal' values are allowed)"
        },
        range: {
            incorrect: "Options are incorrect (option 'range' can only be 'min', 'max' or typeof 'boolean')"
        },
        step: {
            incorrect: "Options are incorrect (option 'step' value should be between 'min' and 'max')"
        },
        tooltip: {
            incorrect: "Options are incorrect (option 'tooltip' should be boolean true or false, or function)",
            incorrectFunction: "Options are incorrect ('tooltip's function should return string or number)"
        },
        animate: {
            incorrect: "Options are incorrect (option 'animate' should be 'false', 'slow', 'fast' or number)"
        },
        labels: {
            incorrect: "Options are incorrect (option 'labels' can only be true false, " +
                "or function returning string or number)",
            incorrectFunction: "Options are incorrect ('labels' function should return string or number)"
        },
        pips: {
            incorrect: "Options are incorrect (option 'pips' should be true or false)"
        }
    };

    whenOptionsAreIncorrect(callback: (error: string) => void) {
        this._incorrectOptionsReceivedSubject.addObserver((error: string) => {
            callback(error);
        });
    }

    whenOptionsSet(callback: () => void) {
        this._optionsSetSubject.addObserver(() => {
            callback();
        });
    }

    whenValueUpdated(callback: () => void) {
       this._valueUpdatedSubject.addObserver(() => {
           callback();
       }) ;
    };

    static get optionsErrors() {
        return SliderModel._optionsErrors;
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
            tooltip: false,
            animate: "fast",
            pips: false,
            labels: false,

            classes: classes
        };
    };

    refreshValue(value: Options["value"]) {
        if ( value < this._options.min ) value = this._options.min;
        if ( value > this._options.max ) value = this._options.max;

        this._options.value = value;

        this._valueUpdatedSubject.notifyObservers();
    }

    destroy() {
        if ( !this._options ) {
            this._throw(SliderModel._optionsErrors.notSet);
        }

        this._options = null;
    }

    getOptions(option?: keyof Options, className?: keyof UserOptions['classes']): Options | Options[keyof Options] |
        Options["classes"][keyof Options["classes"]] {

        const errors = SliderModel._optionsErrors;

        if ( !this._options ) {
            this._throw(SliderModel._optionsErrors.notSet);

            return;
        }

        if ( !option && !className ) return this._options as Options;

        if ( option ) {
            if ( !!option && !(option in this._options) ) {
                this._throw(errors.options.notExisting(option));

                return;
            }

            const userClasses: (keyof UserOptions['classes'])[] = [
                this._classes.slider.main,
                this._classes.range,
                this._classes.handle
            ];

            if ( className && !userClasses.includes(className) ) {
                this._throw(errors.classes.notExisting(className));

                return;
            }

            if ( option && className && option !== 'classes') {
                this._throw(errors.classes.contains);

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

    setOptions(options?: UserOptions | keyof Options, ...restOptions: RestOptionsToSet[]) {
        const errors = SliderModel._optionsErrors;

        if ( restOptions.length !== 0 && typeof options === "string" ) {
            if ( !this._options ) {
                this._throw(SliderModel._optionsErrors.notSet);

                return;
            }

            if ( restOptions.length === 1 || restOptions.length === 2 ) {
                const optionsObject =
                    this._extendBySingleOption(options, ...restOptions as UserOptions[keyof UserOptions][]);

                if ( !optionsObject.result ) return false;

                this._options = optionsObject.options;

                optionsObject.options = null;

                this._deleteWSFromUserCLasses();
            }

        } else if ( typeof options === "object" && restOptions.length === 0 ) {

            const optionsObject = this._extendByOptionsObject(options);

            if ( !optionsObject.result ) return;

            this._options = optionsObject.options;

            this._deleteWSFromUserCLasses();

        } else if ( !options && restOptions.length === 0 ) {
            if ( this._options ) {
                this._throw(errors.alreadySet);

                return;
            }

            this._options = SliderModel.getDefaultOptions('horizontal');
        } else {

            return this._throw(errors.incorrectOptions);
        }

        this._optionsSetSubject.notifyObservers();
    }

    private _extendByOptionsObject(options: UserOptions) {
        let _currentOptions: Options;

        if ( this._options ) {
            _currentOptions = $.extend(true, {}, this._options);

            if ( (options as Options).orientation && (options).orientation !== this._options.orientation ) {
                const optionsObject =
                    this._changeOrientationClass(_currentOptions, 'result', (options).orientation);

                optionsObject.options = null;

                if ( !optionsObject.result ) return { result: false };
            }

            const optionsObject =
                this._changeOrientationClass(options, 'user',
                    (options).orientation ? (options).orientation :
                        this._options.orientation);

            optionsObject.options = null;

            if ( !optionsObject.result ) return { result: false };

        } else {
            _currentOptions = SliderModel.getDefaultOptions((options).orientation);

            const optionsObject =
                this._changeOrientationClass(options, 'user', (options).orientation);

            optionsObject.options = null;

            if ( !optionsObject.result ) return { result: false };
        }

        let _defaultOptions: Options | null = $.extend(true, {}, _currentOptions);

        const _options: Options = $.extend(true, _defaultOptions, options);

        _defaultOptions = null;

        if ( !this._checkOptions(_options) ) {
            return { result: false };
        } else {
            return {
                options: _options,
                result: true
            };
        }
    }

    private _extendBySingleOption(option: keyof Options,
                                  ...restOptions: (keyof UserOptions["classes"] | UserOptions[keyof UserOptions])[]) {

        const errors = SliderModel.optionsErrors;

        if ( !((option as keyof Options) in this._options) ) {
            this._throw(errors.options.notExisting(option));

            return { result: false };
        }

        const optionsCopy = $.extend(true, {}, this._options);

        if ( restOptions.length === 1 ) {
            if (option === "classes" && typeof restOptions[0] === "object") {
                const classes = restOptions[0] as UserOptions["classes"];

                if (this._classes.slider.main in classes) {
                    classes[this._classes.slider.complete(this._options.orientation)] =
                        classes[this._classes.slider.main];

                    delete classes[this._classes.slider.main];
                }

                $.extend(optionsCopy.classes, classes);
            } else if ( option === "orientation" ) {
                if ( restOptions[0] !== optionsCopy.orientation ) {
                    this._changeOrientationClass(optionsCopy,
                        "result",
                        restOptions[0] as Options["orientation"]
                    );

                    optionsCopy[option] = restOptions[0] as Options["orientation"];
                }
            } else if ( option === "value" ) {
                if ( typeof restOptions[0] !== "number" ) {
                    this._throw(errors.options.incorrectType(option, "number"));

                    return { result: false };
                }

                if ( restOptions[0] < this._options.min || restOptions[0] > this._options.max ) {
                    this._throw(errors.value.beyond);

                    return { result: false };
                }

                optionsCopy[option] = restOptions[0] as Options["value"];

            } else if ( option === "min" || option === "max" ) {
                if ( typeof restOptions[0] !== "number" ) {
                    this._throw(errors.options.incorrectType(option, "number"));

                    return { result: false };
                }

                if ( (option === "min" && restOptions[0] > this._options.value) ||
                    option === "max" && restOptions[0] < this._options.value) {

                    this._throw(errors.minAndMax.lessOrMore(option,
                        option === "min" ? 'more' : 'less'));

                    return { result: false };
                }

                optionsCopy[option] = restOptions[0] as Options["min" | "max"];

            } else if ( option === "step" ) {
                if ( restOptions[0] > (this._options.max - this._options.min) || restOptions[0] <= 0 ) {
                    this._throw(errors.step.incorrect);

                    return { result: false };
                }

                optionsCopy[option] = restOptions[0] as Options["step"];

            } else if ( option === "tooltip" ) {
                if ( typeof restOptions[0] !== "boolean" && typeof restOptions[0] !== "function") {
                  this._throw(errors.tooltip.incorrect);

                  return { result: false };
                }

                if ( typeof restOptions[0] === "function" ) {
                    const result = (restOptions[0] as ValueFunction)(this._options.value);

                    if ( typeof result !== "number" && typeof result !== "string" ) {
                        this._throw(errors.tooltip.incorrectFunction);

                        return { result: false };
                    }
                }

                optionsCopy[option] = restOptions[0] as Options["tooltip"];
            } else if ( option === "animate" ) {
              if ( restOptions[0] !== false && restOptions[0] !== "slow" && restOptions[0] !== "fast"
              && typeof restOptions[0] !== "number" ) {
                  this._throw(errors.animate.incorrect);

                  return { result: false };
              }

                optionsCopy[option] = restOptions[0] as Options["animate"];
            } else if ( option === "labels" ) {
                if ( typeof restOptions[0] !== "boolean" && typeof restOptions[0] !== "function") {
                    this._throw(errors.labels.incorrect);

                    return { result: false };
                }

                if ( typeof restOptions[0] === "function") {
                    const result = (restOptions[0] as ValueFunction)(this._options.value);

                    if ( typeof result !== "string" && typeof result !== "number" ) {
                        this._throw(errors.labels.incorrectFunction);

                        return { result: false };
                    }
                }

                optionsCopy[option] = restOptions[0] as Options["labels"];

            } else if ( option === "pips" ) {
                if ( typeof restOptions[0] !== "boolean" ) {
                    this._throw(errors.pips.incorrect);

                    return { result: false };
                }

                optionsCopy[option] = restOptions[0] as Options["pips"];

            } else {
                let optionObj: any = {};
                optionObj[option] = restOptions[0];

                $.extend(optionsCopy, optionObj as Options);
            }

            if ( !this._checkOptions(optionsCopy) ) return { result: false };

            return {
                result: true,
                options: optionsCopy
            }
        }

        if ( restOptions.length === 2 ) {
            if ( option !== 'classes' ) {
                this._throw(errors.classes.twoExtra);

                return { result: false };
            }

            const classNames = [
                this._classes.slider.main,
                this._classes.range,
                this._classes.handle
            ];

            if ( typeof restOptions[0] !== 'string' ||
                !classNames.includes(restOptions[0] as keyof UserOptions["classes"]) ) {

                this._throw(errors.classes.notExisting(restOptions[0] as string));

                return { result: false };
            }

            let className: keyof Options['classes'];

            if ( restOptions[0] === this._classes.slider.main ) {
                className = this._classes.slider.complete(this._options.orientation);
            } else {
                className = restOptions[0] as keyof Options["classes"];
            }

            if ( typeof restOptions[1] !== "string" ) {
                this._throw(errors.classes.customIsNotString);

                return { result: false };
            }

            optionsCopy[option as "classes"][className] = restOptions[1] as keyof Options["classes"];

            if ( !this._checkOptions(optionsCopy) ) return { result: false };

            return {
                result: true,
                options: optionsCopy
            }
        }
    }

    private _checkOptions(options: Options): boolean {
        const defaults = SliderModel.getDefaultOptions(options.orientation);

        const errors = SliderModel._optionsErrors;

        if (!arrayEquals(Object.keys(options), Object.keys(defaults))) {
            this._throw(errors.incorrectOptionsObject);

            return false;
        }

        let mainClass: keyof typeof  options.classes;

        for (mainClass in options.classes) {
            if ( mainClass.trim() !== mainClass ) {
                this._throw(errors.classes.extraWs);

                return false;
            }
        }

        if (!arrayEquals(Object.keys(options.classes),
            Object.keys(defaults.classes))) {

            this._throw(errors.classes.incorrectFormat);

            return false;
        }

        for (mainClass in options.classes) {
            if ( typeof options.classes[mainClass] !== "string" ) {
                this._throw(errors.options.incorrectType("classes", "string"));

                return false;
            }
        }

        const checkType = (type: 'string' | 'number' | 'boolean', options: Options, ...params: (keyof Options)[]) => {
            for ( let param of params ) {
                if ( typeof options[param] !== type ) {
                    this._throw(errors.options.incorrectType(param, type));

                    return false;
                }
            }

            return true;
        };

        if ( !checkType("number", options, "min", "max", "step", "value") ) {
            return false;
        }

        if ( options.orientation !== "horizontal" && options.orientation !== "vertical" ){
            this._throw(errors.orientation.incorrect);

            return false;
        }

        if ( options.range !== "min" && options.range !== "max" && typeof options.range !== "boolean" ) {
            this._throw(errors.range.incorrect);

            return false;
        }

        if ( !(options.min <= options.value && options.max >= options.value) ) {
            this._throw(errors.value.beyond);

            return false;
        }

        if ( options.step > (options.max - options.min) || options.step <= 0 ) {
            this._throw(errors.step.incorrect);

            return false;
        }

        if ( typeof options.tooltip !== "boolean" && typeof options.tooltip !== "function") {
            this._throw(errors.tooltip.incorrect);

            return false;
        }

        if ( typeof options.tooltip === "function" ) {
            const result = options.tooltip(options.value);

            if ( typeof result !== "number" && typeof result !== "string" ) {
                this._throw(errors.tooltip.incorrectFunction);

                return false;
            }
        }

        if ( options.animate !== false && options.animate !== "slow" && options.animate !== "fast"
            && typeof options.animate !== "number" ) {
            this._throw(errors.animate.incorrect);

            return false;
        }

        if ( typeof options.pips !== "boolean" ) {
            this._throw(errors.pips.incorrect);

            return false;
        }

        if ( typeof options.labels !== "function" && typeof options.labels !== "boolean" ) {
            this._throw(errors.labels.incorrect);

            return false;
        }

        if ( typeof options.labels === "function" ) {
            const result = options.labels(options.value);
            if ( typeof result !== "string" && typeof result !== "number" ) {
                this._throw(errors.labels.incorrectFunction);

                return false;
            }
        }

        return true;
    }

    private _changeOrientationClass(options: Options | UserOptions, type: 'user' | 'result',
                                    orientation: 'horizontal' | 'vertical' | undefined) {

        if ( orientation !==  undefined && orientation !== 'horizontal' && orientation !== 'vertical' )  {
            this._throw(SliderModel._optionsErrors.orientation.incorrect);

            return { result: false };
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

        return {
            result: true,
            options: options
        };
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

    set handlePositionInPercents(positionInPercents: number) {
        this._handlePositionInPercents = positionInPercents;
    }

    private _throw(error: string) {
        this._incorrectOptionsReceivedSubject.notifyObservers(error);
    }
}

export default SliderModel;


