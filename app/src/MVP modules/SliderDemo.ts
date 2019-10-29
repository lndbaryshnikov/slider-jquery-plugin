import {JQueryElementWithSlider} from "../jquery-slider";
import SliderPresenter from "./Slider/SliderPresenter";

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

    constructor(private _slider: SliderPresenter, private _root: HTMLDivElement) {
        this._slider.initialize(this._root, {
            labels: true,
            tooltip: true,
            max: 10
        });
    }

    private _createPanel() {
        const blockClassName = "config-panel";

        const getElem = (elem: string, className: string) => {
            const div = document.createElement(elem);
            div.setAttribute("class", `${blockClassName}__${className}`);

            return div;
        };

        const createItem = (type: "input" | "select") => {
            const wrapper = getElem("div", "item-wrapper");
            const sign = getElem("div", "item-sign");
            const element = getElem(type, `item-${type}`);



        }
    }
}