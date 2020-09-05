import Presenter, { CompleteUserOptions } from '../../../src/plugin/components/Presenter/Presenter';
import MainView from '../../../src/plugin/components/View/MainView';
import Model from '../../../src/plugin/components/Model/Model';
import errorsList from '../../../src/plugin/components/ErrorHandler/errorList';

describe('Presenter', () => {
  let slider: Presenter;
  let root: HTMLDivElement;

  const getRoot = (): HTMLDivElement => document.querySelector('.jquery-slider');

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
    slider = new Presenter(new MainView(), new Model());
  });

  afterEach(() => {
    root.remove();

    const newRoot = document.querySelector('.jquery-slider');
    if (newRoot) newRoot.remove();
  });

  describe('Initialize method', () => {
    test('throws exception when initialize again', () => {
      slider.initialize(root);

      expect(() => {
        slider.initialize(root);
      }).toThrow(errorsList.pluginErrors.rendered);
    });
  });

  describe('setOptions method', () => {
    test('throws exceptions when options are not an object', () => {
      expect(() => {
        slider.setOptions('options' as CompleteUserOptions);
      }).toThrow(errorsList.optionErrors.common.notAnObject);
    });

    test('options are set successfully with styles', () => {
      const customOptions = {
        min: 30,
        value: 50,
        styles: {
          slider: 'orange',
        },
      };

      slider.setOptions(customOptions);

      const expectedOptions = {
        ...Model.defaultOptions,
        ...customOptions,
      };

      expect(slider.getOptions()).toEqual(expectedOptions);
    });

    test('options are set successfully without styles', () => {
      const customOptions = {
        min: 30,
        value: 50,
        pips: true,
      };

      slider.setOptions(customOptions);

      const expectedOptions = {
        ...Model.defaultOptions,
        ...customOptions,
      };

      expect(slider.getOptions()).toEqual(expectedOptions);
    });
  });

  describe('destroy method', () => {
    test('slider does not exist on dom after destroying', () => {
      slider.initialize(root);

      const range = document.querySelector('.jquery-slider__range');
      const handle = document.querySelector('.jquery-slider__handle');
      const newRoot = getRoot();

      expect(document.body.contains(newRoot)).toBeTruthy();
      expect(newRoot.contains(range)).toBeTruthy();
      expect(newRoot.contains(handle)).toBeTruthy();

      slider.destroy();

      expect(document.body.contains(newRoot)).not.toBeTruthy();
    });
  });

  describe('render method', () => {
    test('throws exceptions when render without setup', () => {
      expect(() => {
        slider.render(root);
      }).toThrow(errorsList.pluginErrors.notSetUp);
    });

    test('throws exceptions when slider is already rendered', () => {
      slider.initialize(root);

      expect(() => {
        slider.render(root);
      }).toThrow(errorsList.pluginErrors.rendered);
    });
  });

  describe('Subscribers', () => {
    test('validateValue and updateValue methods', () => {
      slider.initialize(root, { value: 50 });

      expect(slider.getOptions().value).toBe(50);

      slider.validateNewValue(10);

      const modelValue = slider.getModel().getOptions().value;
      const viewValue = slider.getView().getOptions().value;

      expect(modelValue).toBe(10);
      expect(viewValue).toBe(10);
    });

    test('calling change option function when updating view value', () => {
      const changeSpy = jest.fn();

      slider.initialize(root, { value: 35, change: changeSpy });
      // first call during options validation
      expect(changeSpy).toBeCalledTimes(1);

      slider.updateValue();

      expect(changeSpy).toBeCalledTimes(2);
      expect(changeSpy).lastCalledWith(35);
    });
  });
});
