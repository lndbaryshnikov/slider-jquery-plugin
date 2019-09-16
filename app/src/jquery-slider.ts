//import $ from 'jquery'

import SliderModel, {Options, UserOptions} from './MVP modules/Slider/SliderModel'
import SliderView from './MVP modules/Slider/SliderView'
import SliderPresenter from './MVP modules/Slider/SliderPresenter'

import './styles/jquery-slider.scss'
import './styles/jquery-slider-range.scss'
import './styles/jquery-slider-handle.scss'

export interface JQueryElementWithSlider extends JQuery<HTMLElement> {
    slider: (method?: UserOptions | keyof SliderMethods, ...options: (UserOptions | string)[]) => void;
}

interface SliderMethods {
    init: (options?: Options) => this;
    options: (...options: (UserOptions | string)[]) => this;
}

(( $ ) => {
    const sliderMethods = {
        getData(element: JQueryElementWithSlider) {
            return element.data('slider');
        },

        setData(root: JQueryElementWithSlider, slider: SliderPresenter) {
            root.data('slider', {
                root: root,
                slider: slider
            });
        },

        throwErr(existsOrNot: boolean): void {
            if ( !!existsOrNot ) {
                throw new Error('jQuery.slider already exists on this DOM element');
            }

            if ( !existsOrNot ) {
                throw new Error('jQuery.slider doesn\'t exist on this DOM element');
            }

            throw new Error('Incorrect argument');
        },

        init(userOptions?: UserOptions) {
            const $this = (this as unknown as JQueryElementWithSlider).eq(0);

            if ( !sliderMethods.getData($this) ) {
                const slider = new SliderPresenter(new SliderView(), new SliderModel());

                slider.initialize($this[0], userOptions);

                sliderMethods.setData($this, slider);

                return $this;
            } else {
                sliderMethods.throwErr(true);
            }

        },
        options(...userOptions: (UserOptions | string)[] ) {
            const $this = (this as unknown as JQueryElementWithSlider).eq(0);

            const data = sliderMethods.getData($this);
            if ( !!data ) {
                const slider = data.slider;

                if ( userOptions.length === 1 || typeof userOptions[0] === "object" ) {
                    slider.setOptions(userOptions[0] as UserOptions);

                    return $this;
                }
            } else {
                sliderMethods.throwErr(false);
            }
        }
    };

    ($.fn as JQueryElementWithSlider).slider = function (method?: UserOptions | keyof SliderMethods, ...options: (UserOptions | string)[]) {
        if ( sliderMethods[ method as keyof SliderMethods ] ) {
            return sliderMethods[ method as keyof SliderMethods ].apply( this, options );

        } else if ( typeof method === 'object' || ( !method && options.length === 0 ) ) {
            return sliderMethods.init.call(this, method as UserOptions);

        } else {
            $.error( 'Method "' +  method + '" doesn\'t exist for jQuery.slider' );
        }
    };
})(jQuery);


