import arrayEquals from "../../functions/common/arrayEquals";
import Observer from "../Observer";

export type HorizontalClasses = {
    "jquery-slider jquery-slider-horizontal": string;
    "jquery-slider-range": string;
    "jquery-slider-handle": string;
}

export type VerticalClasses = {
    "jquery-slider jquery-slider-vertical": string;
    "jquery-slider-range": string;
    "jquery-slider-handle": string;
}

export type ValueFunction = (value?: Options["value"]) => string | number;

export type ChangeFunction = ((value: number | number[]) => void);

export type Options = {
    min: number;
    max: number;
    step: number;
    value: number | number[];
    orientation: "horizontal" | "vertical";
    range: "min" | "max" | boolean;
    tooltip: boolean | ValueFunction;
    animate: "slow" | "fast" | false | number;
    labels: true | false | ValueFunction;
    pips: boolean;
    change: ChangeFunction | false;

    classes: HorizontalClasses | VerticalClasses;
};

export type UserOptions = {
    min?: number;
    max?: number;
    step?: number;
    value?: number | number[];
    orientation?: "horizontal" | "vertical";
    range?: "min" | "max" | boolean;
    tooltip?: boolean | ValueFunction;
    animate?: "slow" | "fast" | false | number;
    labels?: true | false | ValueFunction;
    pips?: boolean;
    change?: ChangeFunction | false;

    classes?: {
        "jquery-slider"?: string;
        "jquery-slider-range"?: string;
        "jquery-slider-handle"?: string;
    };
};

export type RestOptionsToSet = (UserOptions[keyof UserOptions] | UserOptions["classes"][keyof UserOptions["classes"]]);

class SliderModel {
    private _incorrectOptionsReceivedSubject = new Observer();
    private _optionsSetSubject = new Observer();
    private _valueUpdatedSubject = new Observer();

    private _options: Options | null = null;

    private _classes = {
        slider: {
            main: "jquery-slider" as keyof UserOptions["classes"],
            orientation: (orientation: "horizontal" | "vertical"): keyof Options["classes"] => {
                return `jquery-slider-${orientation}` as keyof Options["classes"];
            },
            complete: (orientation: "horizontal" | "vertical"): keyof Options["classes"] => {
                return `jquery-slider jquery-slider-${orientation}` as keyof Options["classes"];
            },
            horizontal: "jquery-slider-horizontal" as keyof Options["classes"],
            vertical: "jquery-slider-vertical" as keyof Options["classes"]
        },
        range: "jquery-slider-range" as keyof Options["classes"],
        firstHandle: "jquery-slider-handle" as keyof Options["classes"]
    };

    private static _optionsErrors = {
        notSet: "Options are not set (to set options pass options object)",
        alreadySet: "Options are already set (to change - provide options)",
        incorrectOptions: "Incorrect options (should be object or key - value pairs)",
        incorrectOptionsObject: "Options are incorrect (should correspond the required format)",
        options: {
            notExisting: (option: string): string => `Option "${option}" doesn't exist`,
            incorrectType: (option: string, type: string): string => {
                return `Options are incorrect (option '${option}' should be of type '${type}')`
            },
        },
        classes: {
            notExisting: (className: string): string => `Class "${className}" does not exist`,
            contains: "Only option 'classes' contains classes",
            twoExtra: "Only option 'classes' can have two extra arguments",
            customIsNotString: "Class is incorrect (should be a string)",
            extraWs: "Options are incorrect (main classes shouldn't have extra whitespaces)",
            incorrectType: "Options are incorrect (classes should correspond the required format)"
        },
        value: {
            beyond: "Options are incorrect ('value' cannot go beyond 'min' and 'max')",
            incorrectType: "Options are incorrect ('value' can only be of type 'number' or 'array')",
            incorrectArray: "Options are incorrect ('value' array should contain two numbers)",
            rangeNotTrue: "Options are incorrect (array is allowed for 'value' when 'range' is true)",
            rangeTrue: "Options are incorrect ('value' should be array when 'range' is true)"
        },
        minAndMax: {
            lessOrMore: (option: string, lessOrMore: "less" | "more"): string => {
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
        },
        change: {
            incorrect: "Options are incorrect (option 'change' can be only function or false)",
            incorrectFunction: "Options are incorrect ('change' function has " +
                "two arguments and return undefined)"
        }
    };

    whenOptionsAreIncorrect(callback: (error: string) => void): void {
        this._incorrectOptionsReceivedSubject.addObserver((error: string) => {
            callback(error);
        });
    }

    whenOptionsSet(callback: () => void): void {
        this._optionsSetSubject.addObserver(() => {
            callback();
        });
    }

    whenValueUpdated(callback: () => void): void {
       this._valueUpdatedSubject.addObserver(() => {
           callback();
       }) ;
    }

    static get optionsErrors() {
        return SliderModel._optionsErrors;
    }

    static getDefaultOptions(orientation: "horizontal" | "vertical" | undefined): Options {
        if ( orientation === undefined ) orientation = "horizontal";
        let classes: Options["classes"];

        if ( orientation === "horizontal" ) {
            classes = {
                "jquery-slider jquery-slider-horizontal": "",
                "jquery-slider-range": "",
                "jquery-slider-handle": ""
            };
        }
        if ( orientation === "vertical" ) {
            classes = {
                "jquery-slider jquery-slider-vertical": "",
                "jquery-slider-range": "",
                "jquery-slider-handle": ""
            };
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
            change: false,

            classes: classes,
        };
    }

    refreshValue(valueData: [number, string]): void {
        let value = valueData[0];
        const valueNumber = valueData[1];

        if ( value < this._options.min ) value = this._options.min;
        if ( value > this._options.max ) value = this._options.max;

        if ( typeof this._options.value === "number" && this._options.range !== true ) {
            this._options.value = value;
        }

        if ( Array.isArray(this._options.value) && this._options.range === true ) {
            const comparingValueIndex = valueNumber === "first" ? 1 : 0;

            if ( value === this._options.value[comparingValueIndex] ) {
                const multiplier = valueNumber === "first" ? -1 : 1;
                value += multiplier * this._options.step;
            }

            (this._options.value)[valueNumber === "first" ? 0 : 1] = value;
        }

        this._valueUpdatedSubject.notifyObservers();
    }

    destroy(): void {
        if ( !this._options ) {
            this._throw(SliderModel._optionsErrors.notSet);
        }

        this._options = null;
    }

    getOptions(option?: keyof Options, className?: keyof UserOptions["classes"]): Options | Options[keyof Options] |
        Options["classes"][keyof Options["classes"]] {

        const errors = SliderModel._optionsErrors;

        if ( !this._options ) {
            this._throw(SliderModel._optionsErrors.notSet);

            return;
        }

        if ( !option && !className ) return this._options;

        if ( option ) {
            if ( !!option && !(option in this._options) ) {
                this._throw(errors.options.notExisting(option));

                return;
            }

            const userClasses: (keyof UserOptions["classes"])[] = [
                this._classes.slider.main,
                this._classes.range,
                this._classes.firstHandle
            ];

            if ( className && !userClasses.includes(className) ) {
                this._throw(errors.classes.notExisting(className));

                return;
            }

            if ( option && className && option !== "classes") {
                this._throw(errors.classes.contains);

                return;
            }

            if (option && !className) {
                return this._options[option];
            } else {
                if ( className === this._classes.slider.main ) {
                    className = this._classes.slider.complete(this._options.orientation);
                }
                return this._options.classes[className as keyof Options["classes"]];
            }
        }
    }

    setOptions(options?: UserOptions | keyof Options, ...restOptions: RestOptionsToSet[]): void | false {
        const errors = SliderModel._optionsErrors;

        if ( restOptions.length !== 0 && typeof options === "string" ) {
            if ( !this._options ) {
                this._throw(SliderModel._optionsErrors.notSet);

                return;
            }

            if ( restOptions.length === 1 || restOptions.length === 2 ) {
                const optionsObject =
                    this._extendBySingleOption(
                        options,
                        ...restOptions as (keyof UserOptions["classes"] | UserOptions[keyof UserOptions])[]
                    );

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

            this._options = SliderModel.getDefaultOptions("horizontal");
        } else {

            return this._throw(errors.incorrectOptions);
        }

        this._optionsSetSubject.notifyObservers();
    }

    private _extendByOptionsObject(
        options: UserOptions
    ): { result: false } | { options: Options; result: true } {
        let currentOptions: Options;

        if ( this._options ) {
            currentOptions = $.extend(true, {}, this._options);

            if ( (options as Options).orientation && (options).orientation !== this._options.orientation ) {
                const optionsObject =
                    this._changeOrientationClass(currentOptions, "result", (options).orientation);

                optionsObject.options = null;

                if ( !optionsObject.result ) return { result: false };
            }

            const optionsObject =
                this._changeOrientationClass(options, "user",
                    (options).orientation ? (options).orientation :
                        this._options.orientation);

            optionsObject.options = null;

            if ( !optionsObject.result ) return { result: false };

        } else {
            currentOptions = SliderModel.getDefaultOptions((options).orientation);

            const optionsObject =
                this._changeOrientationClass(options, "user", (options).orientation);

            optionsObject.options = null;

            if ( !optionsObject.result ) return { result: false };
        }

        let defaultOptions: Options | null = $.extend(true, {}, currentOptions);

        const extendedOptions: Options = $.extend(true, defaultOptions, options);

        defaultOptions = null;

        if ( !this._checkOptions(extendedOptions) ) {
            return { result: false };
        } else {
            return {
                options: extendedOptions,
                result: true
            };
        }
    }

    private _extendBySingleOption(
        option: keyof Options,
        ...restOptions: (keyof UserOptions["classes"] | UserOptions[keyof UserOptions])[]
    ): { result: boolean; options?: Options } {

        const errors = SliderModel.optionsErrors;

        if ( !(option in this._options) ) {
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
            } else if ( option === "min" || option === "max" ) {
                if ( typeof restOptions[0] !== "number" ) {
                    this._throw(errors.options.incorrectType(option, "number"));

                    return { result: false };
                }

                if ( typeof this._options.value === "number" ) {
                    if ((option === "min" && restOptions[0] > this._options.value) ||
                        option === "max" && restOptions[0] < this._options.value) {

                        this._throw(errors.minAndMax.lessOrMore(option,
                            option === "min" ? "more" : "less"));

                        return { result: false };
                    }
                }
                if ( Array.isArray(this._options.value) ) {
                    if ( (option === "min" && (restOptions[0] > this._options.value[0] ||
                    restOptions[0] > this._options.value[1])) ||
                        (option === "max" && (restOptions[0] < this._options.value[0] ||
                    restOptions[0] < this._options.value[1])) ) {

                        this._throw(errors.minAndMax.lessOrMore(option,
                            option === "min" ? "more" : "less"));

                        return { result: false };
                    }

                }

                optionsCopy[option] = restOptions[0] as Options["min" | "max"];
            } else {
                const optionObj: any = {};
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
            if ( option !== "classes" ) {
                this._throw(errors.classes.twoExtra);

                return { result: false };
            }

            const classNames = [
                this._classes.slider.main,
                this._classes.range,
                this._classes.firstHandle
            ];

            if ( typeof restOptions[0] !== "string" ||
                !classNames.includes(restOptions[0] as keyof UserOptions["classes"]) ) {

                this._throw(errors.classes.notExisting(restOptions[0] as string));

                return { result: false };
            }

            let className: keyof Options["classes"];

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

        const optionsKeys = Object.keys(options);
        const defaultOptionsKeys = Object.keys(defaults);

        if ( !arrayEquals(optionsKeys, defaultOptionsKeys) ) {
            this._throw(errors.incorrectOptionsObject);

            return false;
        }

        let mainClass: keyof typeof  options.classes;

        for (mainClass in options.classes) {
            if ( !options.classes.hasOwnProperty(mainClass) ) continue;

            if ( mainClass.trim() !== mainClass ) {
                this._throw(errors.classes.extraWs);

                return false;
            }
        }

        const classesKeys = Object.keys(options.classes);
        const defaultClassesKeys = Object.keys(defaults.classes);

        if ( !arrayEquals(classesKeys, defaultClassesKeys) ) {
            this._throw(errors.classes.incorrectType);

            return false;
        }

        for (mainClass in options.classes) {
            if ( !options.classes.hasOwnProperty(mainClass) ) continue;

            if ( typeof options.classes[mainClass] !== "string" ) {
                this._throw(errors.options.incorrectType("classes", "string"));

                return false;
            }
        }

        const checkType = (
            type: "string" | "number" | "boolean",
            options: Options, ...params: (keyof Options)[]
        ): boolean => {
            for ( const param of params ) {
                if ( typeof options[param] !== type ) {
                    this._throw(errors.options.incorrectType(param, type));

                    return false;
                }
            }

            return true;
        };

        if ( !checkType("number", options, "min", "max", "step") ) {
            return false;
        }

        if ( typeof options.value !== "number" && !Array.isArray(options.value) ) {
            this._throw(errors.value.incorrectType);

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

        if ( options.range !== true && Array.isArray(options.value) ) {
            this._throw(errors.value.rangeNotTrue);
        }

        if ( options.range === true && !Array.isArray(options.value) ) {
            this._throw(errors.value.rangeTrue);
        }

        if ( Array.isArray(options.value) ) {
            for (const value of options.value) {
                if ( !(options.min <= value && options.max >= value) ) {
                    this._throw(errors.value.beyond);

                    return false;
                }
            }
        } else {
            if (!(options.min <= options.value && options.max >= options.value)) {
                this._throw(errors.value.beyond);

                return false;
            }
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

        if ( typeof options.change !== "function" && options.change !== false ) {
            this._throw(errors.change.incorrect);

            return false;
        }

        if ( typeof options.change === "function" ) {
            const func = options.change;

            if ( typeof func(options.value) !== "undefined" ) {
                this._throw(errors.change.incorrectFunction);

                return;
            }
        }

        return true;
    }

    private _changeOrientationClass(
        options: Options | UserOptions, type: "user" | "result",
        orientation: "horizontal" | "vertical" | undefined
    ): { result: boolean; options?: Options | UserOptions } {

        if ( orientation !==  undefined && orientation !== "horizontal" && orientation !== "vertical" )  {
            this._throw(SliderModel._optionsErrors.orientation.incorrect);

            return { result: false };
        }
        if ( orientation === undefined ) orientation = "horizontal";

        if ( type === "user" && options.classes && (options as UserOptions).classes[this._classes.slider.main] ) {
            options.classes[this._classes.slider.complete(orientation)] =
                (options as UserOptions).classes[this._classes.slider.main];

            delete (options as UserOptions).classes[this._classes.slider.main];
        }

        if ( type === "result" ) {
            let mainClass: keyof Options["classes"];
            const values: string[] = [];

            for (mainClass in options.classes) {
                if ( !options.classes.hasOwnProperty(mainClass) ) continue;

                values.push(options.classes[mainClass]);

                delete options.classes[mainClass];
            }

            options.classes[this._classes.slider.complete(orientation)] = values[0];
            options.classes[this._classes.range] = values[1];
            options.classes[this._classes.firstHandle] = values[2];
        }

        return {
            result: true,
            options: options
        };
    }

    private _deleteWSFromUserCLasses(): void {
        const classes = this._options.classes;
        let key: keyof typeof classes;

        for ( key in this._options.classes ) {
            if ( !this._options.classes.hasOwnProperty(key) ) continue;

            if ( this._options.classes[key] !== "" ) {
                this._options.classes[key] = this._options.classes[key]
                    .trim()
                    .replace(/\s+/g, " ");
            }
        }
    }

    private _throw(error: string): void {
        this._incorrectOptionsReceivedSubject.notifyObservers(error);
    }
}

export default SliderModel;


