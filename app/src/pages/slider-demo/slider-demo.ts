import SliderDemo from '../../plugin/SliderDemo/SliderDemo';
import SliderPresenter from '../../plugin/Slider/SliderPresenter';
import SliderModel from '../../plugin/Slider/SliderModel';
import SliderView from '../../plugin/Slider/SliderView';

import '../../styles/jquery-slider/jquery-slider.scss';
import './slider-demo.styles';
import '../../assets/favicons/favicons';

(() => {
  const getDiv = (className: string, text?: string): HTMLDivElement => {
    const div = document.createElement('div');

    div.setAttribute('class', className);
    div.innerHTML = text || '';

    return div;
  };

  const wrapper = getDiv('samples-wrapper');

  const header = getDiv(
    'header',
    'slider-jquery-plugin demo page',
  );

  const sign = getDiv(
    'sign',
    'Leonid Baryshnikov (GitHub: https://github.com/lndbaryshnikov)',
  );

  document.body.append(header, wrapper);

  const getSlider = () => new SliderPresenter(new SliderView(), new SliderModel());

  new SliderDemo(getSlider(), {
    range: 'min',
    labels: true,
    tooltip: true,
    max: 10,
    value: 3,
    classes: {
      'jquery-slider': 'slider',
    },
  }, wrapper).render();

  new SliderDemo(getSlider(), {
    range: true,
    orientation: 'vertical',
    value: [3, 8],
    max: 10,
    labels: true,
    tooltip: true,
    classes: {
      'jquery-slider': 'slider',
      'jquery-slider-range': 'slider__range_color_orange',
      'jquery-slider-handle': 'slider__handle_color_gray',
    },
  }, wrapper).render();

  new SliderDemo(getSlider(), {
    range: 'max',
    tooltip: true,
    max: 8,
    value: 5,
    labels: false,
    classes: {
      'jquery-slider': 'slider',
      'jquery-slider-handle': 'slider__handle_color_white',
    },
  }, wrapper).render();

  new SliderDemo(getSlider(), {
    range: 'min',
    tooltip: true,
    max: 20,
    value: 10,
    labels: false,
    pips: true,
    classes: {
      'jquery-slider': 'slider',
      'jquery-slider-range': 'slider__range_color_orange',
      'jquery-slider-handle': 'slider__handle_color_white',
    },
  }, wrapper).render();

  document.body.append(sign);
})();
