import './main.scss';
import Presenter, { CompleteUserOptions } from './Presenter/Presenter';
import MainView from './View/MainView';
import Model from './Model/Model';

interface SliderElement extends JQuery<HTMLElement> {
  slider: (
    method?: CompleteUserOptions | keyof PluginMethods,
    options?: CompleteUserOptions
  ) => void;
}

interface PluginMethods {
  init: (options?: CompleteUserOptions) => this;
  options: (options: CompleteUserOptions) => this;
  remove: () => this;
}

(($): void => {
  const getData = (element: JQuery<HTMLElement>): {
    slider?: Presenter;
  } => element.data('slider');

  const setData = ({ root, slider }: {
    root: SliderElement;
    slider: Presenter;
  }): void => {
    root.data('slider', {
      root,
      slider,
    });
  };

  const throwError = (existsOrNot: boolean): void => {
    const message = existsOrNot
      ? 'jQuery.slider already exists on this DOM element'
      : 'jQuery.slider does not exist on this DOM element';

    throw new Error(message);
  };

  const sliderMethods = {
    init(userOptions?: CompleteUserOptions): void | JQuery {
      const $this = ((this as unknown) as SliderElement).eq(0);

      if (!getData($this)) {
        const slider = new Presenter(new MainView(), new Model());

        slider.initialize($this[0], userOptions);

        setData({
          root: $this,
          slider,
        });
        return $this;
      }
      throwError(true);

      return undefined;
    },
    remove(): void {
      const $this = ((this as unknown) as SliderElement).eq(0);
      const data = getData($this);

      if (data) {
        data.slider.remove();
      } else {
        throwError(false);
      }
    },
    options(userOptions?: CompleteUserOptions): (
    | void
    | CompleteUserOptions
    | SliderElement
    ) {
      const $this = ((this as unknown) as SliderElement).eq(0);
      const data = getData($this);
      if (data) {
        const { slider } = data;

        if (!userOptions) {
          return slider.getOptions();
        }
        slider.setOptions(userOptions);

        return $this;
      }
      throwError(false);

      return undefined;
    },
  };

  // eslint-disable-next-line no-param-reassign,func-names
  ($.fn as SliderElement).slider = function (
    method?: CompleteUserOptions | keyof PluginMethods,
    options?: CompleteUserOptions,
  ): void {
    if (sliderMethods[method as keyof PluginMethods]) {
      return sliderMethods[method as keyof PluginMethods].call(this, options);
    }

    const isObjectPassed = typeof method === 'object' && !options;
    const isNothingPassed = !method && !options;
    const isObjectOrNothingPassed = isObjectPassed || isNothingPassed;

    if (isObjectOrNothingPassed) {
      const pluginOptions = method as CompleteUserOptions;

      return sliderMethods.init.call(this, pluginOptions);
    }
    $.error(`Method '${method}' doesn't exist for jQuery.slider`);

    return undefined;
  };
})(jQuery);

export default SliderElement;
