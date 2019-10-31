import SliderPresenter from "./Slider/SliderPresenter";
import {Options} from "./Slider/SliderModel";

type Item = {
    wrapper : HTMLDivElement,
    sign: HTMLDivElement,
};

type InputItem = Item & { input: HTMLInputElement };
type SelectItem = Item & { select: HTMLSelectElement };

type ValueItem = Item & {
    firstInput: HTMLInputElement,
    secondInput: HTMLInputElement
}

interface ConfigPanel {
    wrapper: HTMLDivElement;
    min: InputItem;
    max: InputItem;
    step: InputItem;
    value: ValueItem;
    orientation: SelectItem,
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
            labels: true,
            tooltip: true,
            max: 10
        });

        this._createPanel();
        this._addHandlers();
    }

    render() {
        this._root.append(this._wrapper);
        this._slider.render(this._wrapper);
        this._wrapper.append(this._configPanel.wrapper);
    }

    private _createPanel() {
        const panelBlockClass = "config-panel";
        const itemBlockClass = "item";

        const getPanelBlockDiv = (className: string) => {
            const div = document.createElement("div");
            div.setAttribute("class", `${panelBlockClass}__${className}`);
            return div;
        };

        const getItemElement = (elem: string, className: string) => {
            const element = document.createElement(elem);
            element.setAttribute("class", `${itemBlockClass}__${className}`);

            return element;
        };

        type InputSettings = {
            placeholder: string,
            value: string | number
        }

        type ValueSettings = {
            placeholder: string,
            values: [number | string, number | string | null]
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
                secondInput.value = !!values[1] ? String(values[1]) : "";

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
                for ( let i = 0; i < (settings as SelectSettings).length; i += 2 ) {
                    const option = getItemElement("option", "select-option") as HTMLOptionElement;

                    option.value = option.innerHTML = (settings as SelectSettings)[i];

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
            pips: getItem("select", "Tooltip:", ["true", "false"]),
        };

        const items = Object.values(this._configPanel)
            .slice(1)
            .map((item: SelectItem | ValueItem | InputItem) => {
                return item.wrapper;
            });

        this._configPanel.wrapper.append(...items);
    }

    private _refreshSlider(option: keyof Options, value: string | number | boolean | number[]) {
        this._slider.setOptions(option, value);
    }

    private _addHandlers() {
        const elements = this._configPanel;

        let option: keyof ConfigPanel;

        for ( option in elements ) {
            if ( option === "wrapper") continue;
            if ( !elements.hasOwnProperty(option) ) continue;

            if ( option === "min" || option === "max" || option === "step" || option === "value" ) {
                if ( option !== "value" ) {
                    const input = (elements[option] as InputItem).input;

                    input.addEventListener("change", () => {
                        this._refreshSlider(option as keyof Options, Number(input.value));
                    });
                } else {
                    const item = elements[option] as ValueItem;

                    const value = this._slider.getOptions("range") === true ?
                        [Number(item.firstInput.value), Number(item.secondInput.value)] :
                         Number(item.firstInput.value);

                    const valueHandler = () => {
                        this._refreshSlider(option as keyof Options, value);
                    };

                    item.firstInput.addEventListener("change", valueHandler);
                    item.secondInput.addEventListener("change", valueHandler);
                }
            } else {
                const select = (elements[option] as SelectItem).select;

                select.addEventListener("change", () => {
                    this._refreshSlider(
                        option as keyof Options,
                        select.value === "true" ? true : select.value === "false" ? false : select.value
                    );
                });
            }
        }
    }
}