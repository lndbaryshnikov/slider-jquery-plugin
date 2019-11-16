import SliderDemo from "./MVP modules/SliderDemo";
import SliderPresenter from "./MVP modules/Slider/SliderPresenter";
import SliderModel, { UserOptions } from "./MVP modules/Slider/SliderModel";
import SliderView from "./MVP modules/Slider/SliderView";

import "./styles/jquery-slider.styles"
import "./styles/slider-demo.styles"

const getDiv = (className: string, text?: string): HTMLDivElement => {
    const div = document.createElement("div");

    div.setAttribute("class", className);
    div.innerHTML = text ? text : "";

    return div;
};

const wrapper = getDiv("samples-wrapper");

const header = getDiv(
    "header",
    "JQuery-Slider plugin demo page"
);

const sign = getDiv(
    "sign",
    "Leonid Baryshnikov (GitHub: https://github.com/lndbaryshnikov)"
);

document.body.append(header, wrapper);

const getSlider = () => new SliderPresenter(new SliderView(), new SliderModel());

new SliderDemo(getSlider(), {
    range: "min",
    labels: true,
    tooltip: true,
    max: 10,
    value: 3,
    classes: {
        "jquery-slider": "slider-demo__jquery-slider-default"
    }
}, wrapper).render();

new SliderDemo(getSlider(), {
    range: true,
    orientation: "vertical",
    value: [3, 8],
    max: 10,
    labels: true,
    tooltip: true,
    classes: {
        "jquery-slider": "slider-demo__jquery-slider-default",
        "jquery-slider-range": "slider-demo__jquery-slider-range-orange",
        "jquery-slider-handle": "slider-demo__jquery-slider-handle-gray"
    }
}, wrapper).render();

new SliderDemo(getSlider(), {
    range: "max",
    tooltip: true,
    max: 8,
    value: 5,
    labels: false,
    classes: {
        "jquery-slider": "slider-demo__jquery-slider-default",
        "jquery-slider-handle": "slider-demo__jquery-slider-handle-white"
    }
}, wrapper).render();

new SliderDemo(getSlider(), {
    range: "min",
    tooltip: true,
    max: 20,
    value: 10,
    labels: false,
    pips: true,
    classes: {
        "jquery-slider": "slider-demo__jquery-slider-default",
        "jquery-slider-range": "slider-demo__jquery-slider-range-orange",
        "jquery-slider-handle": "slider-demo__jquery-slider-handle-white"
    }
}, wrapper).render();

document.body.append(sign);
