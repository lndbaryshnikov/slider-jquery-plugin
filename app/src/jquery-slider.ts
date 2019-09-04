//import $ from 'jquery'

import SliderModel from './MVP modules/Slider/_model'
import SliderView from './MVP modules/Slider/_view'
import SliderPresenter from './MVP modules/Slider/presenter'

import './styles/jquery-slider.scss'
import './styles/jquery-slider-range.scss'
import './styles/jquery-slider-handle.scss'

const presenter = new SliderPresenter(new SliderView(), new SliderModel());

$("body").append(presenter._view.html);
