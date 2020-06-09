import Presenter from '../../src/plugin/Presenter/Presenter';
import MainView from '../../src/plugin/View/MainView';
import Model from '../../src/plugin/Model/Model';

describe('initialize exceptions', () => {
  let slider: Presenter;

  beforeEach(() => {
    slider = new Presenter(new MainView(), new Model());
  });

  test('throws exceptions when render without setup', () => {
    expect(() => {
      slider.render(document.body);
    }).toThrow('slider is not set up');
  });

  test('throws exception when setUp when slider already set up', () => {
    slider.initialize(document.body);

    expect(() => {
      slider.initialize(document.body);
    }).toThrow('slider is already rendered');
  });
});
