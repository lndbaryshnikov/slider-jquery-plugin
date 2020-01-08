import SliderModel, { Options } from '../../src/MVP modules/Slider/SliderModel';

test("Model's setOptions deletes whitespaces from classes", () => {
  const model = new SliderModel();

  model.setOptions({
    classes: {
      'jquery-slider': '  my-class       another-class',
      'jquery-slider-handle': '  my-firstHandle-class       another-firstHandle-class',
    },
  });

  expect((model.getOptions() as Options).classes).toEqual({
    'jquery-slider jquery-slider-horizontal': 'my-class another-class',
    'jquery-slider-range': '',
    'jquery-slider-handle': 'my-firstHandle-class another-firstHandle-class',
  });
});
