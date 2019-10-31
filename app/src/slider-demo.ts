import SliderDemo from "./MVP modules/SliderDemo";
import SliderPresenter from "./MVP modules/Slider/SliderPresenter";
import SliderModel from "./MVP modules/Slider/SliderModel";
import SliderView from "./MVP modules/Slider/SliderView";

import "./styles/jquery-slider.styles"
import "./styles/slider-demo.styles"

const getSlider = () => new SliderPresenter(new SliderView(), new SliderModel());

new SliderDemo(getSlider(), document.body).render();
new SliderDemo(getSlider(), document.body).render();
new SliderDemo(getSlider(), document.body).render();