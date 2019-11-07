import SliderPresenter from "./Slider/SliderPresenter";
import { Options, UserOptions } from "./Slider/SliderModel";

type Item = {
    wrapper: HTMLDivElement;
    sign: HTMLDivElement;
};

type InputItem = Item & { input: HTMLInputElement };
type SelectItem = Item & { select: HTMLSelectElement };

type ValueItem = Item & {
    firstInput: HTMLInputElement;
    secondInput: HTMLInputElement;
}

interface ConfigPanel {
    wrapper: HTMLDivElement;
    min: InputItem;
    max: InputItem;
    step: InputItem;
    value: ValueItem;
    orientation: SelectItem;
    range: SelectItem;
    tooltip: SelectItem;
    animate: SelectItem;
    labels: SelectItem;
    pips: SelectItem;
}

export default class SliderDemo {
    private _configPanel: ConfigPanel;
    private _wrapper: HTMLDivElement;

    constructor(private _slider: SliderPresenter, private _root: HTMLElement) {
        this._wrapper = document.createElement("div");
        this._wrapper.setAttribute("class", "slider-demo__wrapper");

        this._slider.setOptions({
            range: "min",
            labels: true,
            tooltip: true,
            max: 10
        });

        this._createPanel();
        this._addHandlers();
    }

    render(): void {
        this._root.append(this._wrapper);
        this._slider.render(this._wrapper);
        this._wrapper.append(this._configPanel.wrapper);
    }

    private _createPanel(): void {
        const panelBlockClass = "config-panel";
        const itemBlockClass = "item";

        const getPanelBlockDiv = (className: string): HTMLDivElement => {
            const div = document.createElement("div");
            div.setAttribute("class", `${panelBlockClass}__${className}`);

            return div;
        };

        const getItemElement = (elem: string, className: string): HTMLElement => {
            const element = document.createElement(elem);
            element.setAttribute("class", `${itemBlockClass}__${className}`);

            return element;
        };

        type InputSettings = {
            placeholder: string;
            value: string | number;
        }

        type ValueSettings = {
            placeholder: string;
            values: [number | string, number | string | null];
        }

        type SelectSettings = string[];

        const getItem = <T extends "input" | "select" | "value">(
            type: T,
            text: string,
            settings: InputSettings | SelectSettings | ValueSettings
        ): T extends "input" ? InputItem : T extends "select" ? SelectItem : ValueItem => {
            const wrapper = getItemElement("div", "wrapper") as HTMLDivElement;
            const sign = getItemElement("div", "sign") as HTMLDivElement;

            sign.innerHTML = text;

            wrapper.append(sign);

            if ( type === "value" ) {
                const firstInput = getItemElement("input", "first-input") as HTMLInputElement;
                const secondInput = getItemElement("input", "second-input") as HTMLInputElement;

                wrapper.append(firstInput);
                wrapper.append(secondInput);

                firstInput.placeholder = secondInput.placeholder = (settings as ValueSettings).placeholder;

                const values = (settings as ValueSettings).values;
                firstInput.value = String(values[0]);
                secondInput.value = values[1] ? String(values[1]) : "";

                return {
                    wrapper: wrapper,
                    sign: sign,
                    firstInput: firstInput,
                    secondInput: secondInput
                } as any;
            }

            const element = getItemElement(type, type) as HTMLSelectElement | HTMLInputElement;

            wrapper.append(element);

            if ( type === "select" ) {
                for ( const value of settings as SelectSettings ) {
                    const option = getItemElement("option", "select-option") as HTMLOptionElement;

                    option.value = option.innerHTML = value;

                    element.append(option);
                }

                (element as HTMLSelectElement).selectedIndex = 0;

                return {
                    wrapper: wrapper,
                    sign: sign,
                    select: element as HTMLSelectElement
                } as any;
            }

            if ( type === "input" ) {
                (element as HTMLInputElement).placeholder = (settings as InputSettings).placeholder;
                (element as HTMLInputElement).value = String((settings as InputSettings).value);

                return {
                    wrapper: wrapper,
                    sign: sign,
                    input: element as HTMLInputElement
                } as any;
            }
        };

        this._configPanel = {
            wrapper: getPanelBlockDiv("wrapper"),
            min: getItem("input", "Min:", { placeholder: "type value...", value: 0 }),
            max: getItem("input", "Max:", { placeholder: "type value...", value: 10 }),
            step: getItem("input", "Step:", { placeholder: "type value...", value: 1 }),
            value: getItem("value", "Value:", { placeholder: "", values: [0, null] }),
            orientation: getItem("select", "Orientation:", ["horizontal", "vertical"]),
            range: getItem("select", "Range:", ["min", "max", "false", "true"]),
            tooltip: getItem("select", "Tooltip:", ["true", "false"]),
            animate: getItem("select", "Animate:", ["fast", "slow", "false"]),
            labels: getItem("select", "Labels:", ["true", "false"]),
            pips: getItem("select", "Pips:", ["false", "true"])
        };

        const items = Object.values(this._configPanel)
            .slice(1)
            .map((item: SelectItem | ValueItem | InputItem) => {
                return item.wrapper;
            });

        this._configPanel.wrapper.append(...items);
    }

    private _refreshSlider(option: keyof Options | UserOptions, value?: string | number | boolean | number[]): void {
        if ( typeof option === "object") {
            this._slider.setOptions(option);
            return;
        }

        this._slider.setOptions(option, value);
    }

    private _addHandlers(): void {
        const elements = this._configPanel;

        let option: keyof ConfigPanel;

        for ( option in elements ) {
            if ( !elements.hasOwnProperty(option) ) continue;
            if ( option === "wrapper") continue;

            const optionCopy = option;

            if ( optionCopy === "min" || optionCopy === "max" || optionCopy === "step" || optionCopy === "value" ) {
                if ( optionCopy !== "value" ) {
                    const input = (elements[optionCopy]).input;

                    input.addEventListener("change", () => {
                        this._checkAndTrimPanel();
                        
                        const inputValue = Number(input.value);
                        const lastSliderValue = this._slider.getOptions(optionCopy);

                        try {
                            this._refreshSlider(optionCopy as keyof Options, inputValue);
                        } catch (e) {
                            alert(e);

                            input.value = String(lastSliderValue);
                        }
                    });
                } else {
                    const valueObject = elements[optionCopy];

                    const valueHandler = (): void => {
                        this._checkAndTrimPanel();
                        
                        const firstInputValue = Number(valueObject.firstInput.value);

                        const secondInputValue = typeof Number(valueObject.secondInput.value) === "number" ?
                            Number(valueObject.secondInput.value) : null;

                        const lastOptions = this._slider.getOptions() as Options;

                        const value = !secondInputValue ? [firstInputValue] : [firstInputValue, secondInputValue];
                        let range: Options["range"] = lastOptions.range;

                        if ( value.length === 1 && lastOptions.range === true ) {
                            value.push(lastOptions.max);
                            range = true;

                            this._configPanel.value.secondInput.value = String(lastOptions.max);
                        }

                        if ( value.length === 2 && lastOptions.range !== true ) {
                            range = true;

                            this._configPanel.range.select.value = "true";
                        }

                        try {
                            this._refreshSlider({
                                value: value.length === 1 ? value[0] : value,
                                range: range
                            });
                        } catch (e) {
                            alert(e);
                            if ( Array.isArray(lastOptions.value) ) {
                                valueObject.firstInput.value = String(lastOptions.value[0]);
                                valueObject.secondInput.value = String(lastOptions.value[1]);
                            } else {
                                valueObject.firstInput.value = String(lastOptions.value);
                            }

                            this._configPanel.range.select.value = String(lastOptions.range);
                        }
                    };

                    valueObject.firstInput.addEventListener("change", valueHandler);
                    valueObject.secondInput.addEventListener("change", valueHandler);
                }
            } else {
                const select = (elements[optionCopy]).select;

                select.addEventListener("change", () => {
                    const selectValue = select.value === "true" ?
                        true : select.value === "false" ? false : select.value;

                    const lastOptions = this._slider.getOptions() as Options;

                    let value: number | number[] = lastOptions.value;

                    if ( optionCopy === "range" ) {
                        if ( selectValue === true && !Array.isArray(lastOptions.value) ) {
                            value = [lastOptions.value, lastOptions.max];

                            this._configPanel.value.secondInput.value = String(lastOptions.max);
                        }

                        if ( selectValue !== true && Array.isArray(lastOptions.value) ) {
                            value = lastOptions.value[0];

                            this._configPanel.value.secondInput.value = "";
                        }
                    }

                    try {
                        this._refreshSlider({
                            value: value,
                            [optionCopy]: selectValue
                        } as UserOptions);
                    } catch(e) {
                        alert(e);

                        this._configPanel.value.secondInput.value =
                            String( (lastOptions.value as number[])[1] ? (lastOptions.value as number[])[1] :
                                "" );

                        select.value = String(lastOptions[optionCopy]);
                    }
                });
            }
        }
    }
    
    private _checkAndTrimPanel(): true | void {
        const inputObjectsNames: (keyof ConfigPanel)[] = ["min", "max", "step", "value"];
        
        for ( const objectName of inputObjectsNames ) {
            if (objectName === "value") {
                const valueObject = this._configPanel[objectName];

                const firstValueTrimmed = valueObject.firstInput.value.trim();
                const secondValueTrimmed = valueObject.secondInput.value.trim();

                const firstIsNumber = typeof Number(firstValueTrimmed) === "number",
                      isSecondNumberOrEmpty = firstValueTrimmed === "" ||
                          typeof Number(firstValueTrimmed) === "number";
                
                if ( !firstIsNumber || !isSecondNumberOrEmpty ) {
                    throw new Error("value should be number");
                }

                valueObject.firstInput.value = firstValueTrimmed;
                valueObject.secondInput.value = secondValueTrimmed;
            } else {
                const valueTrimmed = (this._configPanel[objectName] as InputItem).input.value.trim();

                if ( typeof Number(valueTrimmed) !== "number" ) {
                    throw new Error(`${objectName} should be number`);
                }
            }
        }

        return true;
    }
}
