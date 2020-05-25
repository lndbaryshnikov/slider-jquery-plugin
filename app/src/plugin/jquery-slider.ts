import SliderModel, {
  Options,
  RestOptionsToSet,
  UserOptions,
} from './Model/SliderModel';
import SliderView from './View/SliderView';
import SliderPresenter from './Presenter/SliderPresenter';

import './jquery-slider.scss';

interface JQueryElementWithSlider extends JQuery<HTMLElement> {
  slider: (
    method?: UserOptions | keyof SliderMethods,
    ...options: (UserOptions | keyof Options | RestOptionsToSet)[]
  ) => void;
}

interface SliderMethods {
  init: (options?: Options) => this;
  options: (...options: (UserOptions | string)[]) => this;
}

(($): void => {
  const getData = (element: JQuery<HTMLElement>): {
    slider?: SliderPresenter;
  } => element.data('slider');

  const setData = ({ root, slider }: {
    root: JQueryElementWithSlider;
    slider: SliderPresenter;
  }): void => {
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

        setData({
          root: $this,
          slider,
        });

        return $this;
      }

      throwErr(true);

      return undefined;
    },

    destroy(): void {
      const $this = ((this as unknown) as JQueryElementWithSlider).eq(0);
      const data = getData($this);

      if (data) {
        data.slider.destroy();

        $this.removeData('slider');
      } else throwErr(false);
    },

    options(...userOptions: (UserOptions | string)[]): (
    | void
    | Options[keyof Options]
    | Options
    | JQueryElementWithSlider
    | Options['classes'][keyof Options['classes']]
    ) {
      const $this = ((this as unknown) as JQueryElementWithSlider).eq(0);

      const data = getData($this);
      if (data) {
        const { slider } = data;

        if (userOptions.length === 0) {
          return slider.getOptions() as Options;
        }

        const [firstArg, secondArg] = userOptions;

        const isOnlyObjectPasses = userOptions.length === 1
          && typeof firstArg === 'object';

        if (isOnlyObjectPasses) {
          slider.setOptions(firstArg as UserOptions);

          return $this;
        }

        const isOneArgPassed = userOptions.length === 1;
        const isTwoArgsPassed = userOptions.length === 2;
        const isThreeArgsPassed = userOptions.length === 3;

        const isFirstArgString = typeof firstArg === 'string';
        const isSecondArgString = typeof secondArg === 'string';
        const isFirstArgClasses = firstArg === 'classes';

        const isSingleClassPassed = isThreeArgsPassed && isFirstArgClasses;
        const isNotObjectPassed = isTwoArgsPassed || isSingleClassPassed;
        const isOneOptionPassed = isNotObjectPassed && isFirstArgString;

        const isTwoArgsWithFirstClassPassed = isTwoArgsPassed && isFirstArgClasses;
        const isSingleClassRequested = isTwoArgsWithFirstClassPassed && isSecondArgString;

        if (isOneOptionPassed) {
          if (isSingleClassRequested) {
            return slider.getOptions(
              firstArg as keyof Options,
              secondArg as keyof UserOptions['classes'],
            );
          }

          const options = userOptions.slice(1) as (
            | UserOptions[keyof UserOptions]
            | UserOptions['classes'][keyof UserOptions['classes']]
          )[];

          slider.setOptions(firstArg as keyof Options, ...options);

          return $this;
        }

        const isAnyOptionRequested = (
          (isTwoArgsWithFirstClassPassed || isOneArgPassed)
          && isFirstArgString
        );

        if (isAnyOptionRequested) {
          return slider.getOptions(
            firstArg as keyof Options,
            secondArg as keyof UserOptions['classes'],
          );
        }

        throw new Error('Passed options are incorrect');
      } else {
        throwErr(false);
      }

      return undefined;
    },
  };

  // eslint-disable-next-line no-param-reassign,func-names
  ($.fn as JQueryElementWithSlider).slider = function (
    method?: UserOptions | keyof SliderMethods,
    ...options: (UserOptions | keyof Options | RestOptionsToSet)[]
  ): void {
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

    return undefined;
  };
})(jQuery);

// eslint-disable-next-line import/prefer-default-export
export { JQueryElementWithSlider };
