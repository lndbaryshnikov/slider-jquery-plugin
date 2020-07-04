import Presenter, { CompleteUserOptions } from './Presenter/Presenter';
import MainView from './View/MainView';
import Model from './Model/Model';
import './main.scss';

interface SliderElement extends JQuery<HTMLElement> {
  slider: (
    method?: CompleteUserOptions | keyof PluginMethods,
    options?: CompleteUserOptions
  ) => void;
}

interface PluginMethods {
  init: (userOptions?: CompleteUserOptions) => JQuery | void;
  options: (userOptions?: CompleteUserOptions) => SliderElement | CompleteUserOptions | void;
  destroy: () => void;
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

  const throwExistenceError = (existsOrNot: boolean): void => {
    const message = existsOrNot
      ? 'jQuery.slider already exists on this DOM element'
      : 'jQuery.slider does not exist on this DOM element';

    throw new Error(message);
  };

  const pluginMethods: PluginMethods = {
    init(userOptions?: CompleteUserOptions): JQuery | void {
      const $this = this.eq(0);

      if (!getData($this)) {
        const slider = new Presenter(new MainView(), new Model());

        slider.initialize($this[0], userOptions);

        setData({
          root: $this,
          slider,
        });
        return $this;
      }
      throwExistenceError(true);

      return undefined;
    },
    options(userOptions?: CompleteUserOptions): (
    | void
    | CompleteUserOptions
    | SliderElement
    ) {
      const $this = this.eq(0);
      const data = getData($this);
      if (data) {
        const { slider } = data;

        if (!userOptions) {
          return slider.getOptions();
        }
        slider.setOptions(userOptions);

        return $this;
      }
      throwExistenceError(false);

      return undefined;
    },
    destroy(): void {
      const $this = this.eq(0);
      const data = getData($this);

      if (data) {
        data.slider.destroy();
      } else {
        throwExistenceError(false);
      }
    },
  };

  // eslint-disable-next-line no-param-reassign,func-names
  ($.fn as SliderElement).slider = function (
    methodNameOrOptions?: CompleteUserOptions | keyof PluginMethods,
    options?: CompleteUserOptions,
  ): void {
    const method = pluginMethods[methodNameOrOptions as keyof PluginMethods];
    if (method) {
      return method.call(this, options);
    }

    const isObjectPassed = typeof methodNameOrOptions === 'object' && !options;
    const isNothingPassed = !methodNameOrOptions && !options;
    const isObjectOrNothingPassed = isObjectPassed || isNothingPassed;

    if (isObjectOrNothingPassed) {
      const pluginOptions = methodNameOrOptions as CompleteUserOptions;

      return pluginMethods.init.call(this, pluginOptions);
    }
    throw new Error(`Method '${methodNameOrOptions}' doesn't exist for jQuery.slider`);

    return undefined;
  };
})(jQuery);

export default SliderElement;
