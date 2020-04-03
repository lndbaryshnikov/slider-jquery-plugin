import SliderModel, {
  Options,
  RestOptionsToSet,
  UserOptions,
} from './Slider/SliderModel';
import SliderView from './Slider/SliderView';
import SliderPresenter from './Slider/SliderPresenter';

import './jquery-slider.scss';

export interface JQueryElementWithSlider extends JQuery<HTMLElement> {
  slider: (
    method?: UserOptions | keyof SliderMethods,
    ...options: (UserOptions | keyof Options | RestOptionsToSet)[]
  ) => void;
}

interface SliderMethods {
  init: (options?: Options) => this;
  options: (...options: (UserOptions | string)[]) => this;
}

(($) => {
  const getData = (element: JQueryElementWithSlider): JQuery => element.data('slider');

  const setData = (
    root: JQueryElementWithSlider,
    slider: SliderPresenter,
  ): void => {
    root.data('slider', {
      root,
      slider,
    });
  };

  const throwErr = (existsOrNot: boolean): void => {
    if (existsOrNot) {
      throw new Error('jQuery.slider already exists on this DOM element');
    }

    if (!existsOrNot) {
      throw new Error("jQuery.slider doesn't exist on this DOM element");
    }

    throw new Error('Incorrect argument');
  };

  const sliderMethods = {
    init(userOptions?: UserOptions): void | JQuery {
      const $this = ((this as unknown) as JQueryElementWithSlider).eq(0);

      if (!getData($this)) {
        const slider = new SliderPresenter(new SliderView(), new SliderModel());

        slider.initialize($this[0], userOptions);

        setData($this, slider);

        return $this;
      }
      throwErr(true);
    },

    destroy() {
      const $this = ((this as unknown) as JQueryElementWithSlider).eq(0);
      const data = getData($this);

      if (data) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        data.slider.destroy();
        $this.removeData('slider');
      } else throwErr(false);
    },

    options(...userOptions: (UserOptions | string)[]) {
      const $this = ((this as unknown) as JQueryElementWithSlider).eq(0);

      const data = getData($this);
      if (data) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        const { slider } = data;

        if (userOptions.length === 0) {
          return slider.getOptions();
        }

        const isOnlyObjectPasses = userOptions.length === 1 && typeof userOptions[0] === 'object';

        if (isOnlyObjectPasses) {
          slider.setOptions(userOptions[0] as UserOptions);

          return $this;
        }

        const isOneArgPassed = userOptions.length === 1;
        const isTwoArgsPassed = userOptions.length === 2;
        const isThreeArgsPassed = userOptions.length === 3;

        const isFirstArgString = typeof userOptions[0] === 'string';
        const isSecondArgString = typeof userOptions[1] === 'string';
        const isFirstArgClasses = userOptions[0] === 'classes';

        const isSingleClassPassed = isThreeArgsPassed && isFirstArgClasses;
        const isNotObjectPassed = isTwoArgsPassed || isSingleClassPassed;
        const isOneOptionPassed = isNotObjectPassed && isFirstArgString;

        const isTwoArgsWithFirstClassPassed = isTwoArgsPassed && isFirstArgClasses;
        const isSingleClassRequested = isTwoArgsWithFirstClassPassed && isSecondArgString;

        if (isOneOptionPassed) {
          if (isSingleClassRequested) {
            return slider.getOptions(
              userOptions[0] as keyof Options,
              userOptions[1] as keyof UserOptions['classes'],
            );
          }

          const options = userOptions.slice(1) as (
            | UserOptions[keyof UserOptions]
            | UserOptions['classes'][keyof UserOptions['classes']]
          )[];

          slider.setOptions(userOptions[0] as keyof Options, ...options);

          return $this;
        }

        const isAnyOptionRequested = (
          (isTwoArgsWithFirstClassPassed || isOneArgPassed)
          && isFirstArgString
        );

        if (isAnyOptionRequested) {
          return slider.getOptions(
            userOptions[0] as keyof Options,
            userOptions[1] as keyof UserOptions['classes'],
          );
        }

        throw new Error('Passed options are incorrect');
      } else {
        throwErr(false);
      }
    },
  };

  // eslint-disable-next-line no-param-reassign,func-names
  ($.fn as JQueryElementWithSlider).slider = function (
    method?: UserOptions | keyof SliderMethods,
    ...options: (UserOptions | keyof Options | RestOptionsToSet)[]
  ) {
    if (sliderMethods[method as keyof SliderMethods]) {
      return sliderMethods[method as keyof SliderMethods].apply(this, options);
    }

    const isObjectPassed = typeof method === 'object';
    const isNothingPassed = !method && options.length === 0;
    const isObjectOrNothingPassed = isObjectPassed || isNothingPassed;

    if (isObjectOrNothingPassed) {
      return sliderMethods.init.call(this, method as UserOptions);
    }
    $.error(`Method '${method}' doesn't exist for jQuery.slider`);
  };
})(jQuery);
