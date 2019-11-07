import SliderDemo from "./MVP modules/SliderDemo";
import SliderPresenter from "./MVP modules/Slider/SliderPresenter";
import SliderModel, { UserOptions } from "./MVP modules/Slider/SliderModel";
import SliderView from "./MVP modules/Slider/SliderView";

import "./styles/jquery-slider.styles"
import "./styles/slider-demo.styles"

const getSlider = () => new SliderPresenter(new SliderView(), new SliderModel());

const userOptions = {
    range: "min",
    labels: true,
    tooltip: true,
    max: 10
} as UserOptions;

new SliderDemo(getSlider(), {
    range: "min",
    labels: true,
    tooltip: true,
    max: 10,
    value: 3
}, document.body).render();

new SliderDemo(getSlider(), {
    range: true,
    orientation: "vertical",
    value: [3, 8],
    max: 10,
    labels: true
}, document.body).render();

new SliderDemo(getSlider(), {
    range: "max",
    tooltip: true,
    max: 8,
    value: 5,
    labels: false
}, document.body).render();
