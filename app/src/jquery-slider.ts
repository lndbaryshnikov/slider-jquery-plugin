//import $ from 'jquery'

import Model from './MVP modules/model/model'
import View from './MVP modules/view/view'
import Presenter from './MVP modules/presenter/presenter'

import './styles/jquery-slider.scss'
import './styles/jquery-slider-range.scss'
import './styles/jquery-slider-handle.scss'

const model = new Model();
const presenter = new Presenter(new View());

presenter.model = model;

$("body").append(presenter.view.html);
