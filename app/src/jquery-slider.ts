//import $ from 'jquery'

import SliderModel, {Options} from './MVP modules/Slider/SliderModel'
import SliderView from './MVP modules/Slider/SliderView'
import SliderPresenter from './MVP modules/Slider/SliderPresenter'

import './styles/jquery-slider.scss'
import './styles/jquery-slider-range.scss'
import './styles/jquery-slider-handle.scss'

export interface JQueryElementWithSlider extends JQuery<HTMLElement> {
    slider: (userOptions?: Options) => void;
}

interface SliderMethods {
    init: (options?: Options) => this;
}

(( $ ) => {
    ($.fn as JQueryElementWithSlider).slider = function (method: Options | keyof SliderMethods, ...options: string[]) {
        const presenter = new SliderPresenter(new SliderView(), new SliderModel());

        const methods = {
            init: (userOptions?: Options) => {
                presenter.initialize(this[0], userOptions);
            }
        };

        if ( methods[ method as keyof SliderMethods ] ) {
            return methods[ method as keyof SliderMethods ].apply( this, options );
        } else if ( typeof method === 'object' || ( !method && options.length === 0 ) ) {
            methods.init.call(this, method as Options);
        } else {
            $.error( 'Method "' +  method + '" doesn\'t exist for jQuery.slider' );
        }
    };
})(jQuery);


