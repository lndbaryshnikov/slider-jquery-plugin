import SliderView from '../../src/plugin/Slider/SliderView';
import SliderModel from '../../src/plugin/Slider/SliderModel';
import SliderLabelsView, {
  LabelOptions,
} from '../../src/plugin/SliderLabelsView/SliderLabelsView';

const extractValue = (value: string) => value
  .replace(/\d+px/, '')
  .replace(/[<>="\\ a-z/\-:;]/gi, '');

describe("tooltip exists on dom and contains 'value'", () => {
  let view: SliderView;
  let labelsView: SliderLabelsView;

  const defaultsWithLabelsAndPips = SliderModel.getDefaultOptions('horizontal');
  defaultsWithLabelsAndPips.labels = (value: number) => `${value}$`;
  defaultsWithLabelsAndPips.pips = true;
  defaultsWithLabelsAndPips.max = 10;

  const labelsOptionsFull: LabelOptions = {
    labels: true,
    pips: true,
    orientation: 'horizontal',
    min: 0,
    max: 10,
    step: 1,
    valueFunc: (value: number) => `${value}$`,
  };

  beforeEach(() => {
    view = new SliderView();
    labelsView = new SliderLabelsView();

    view.setOptions(defaultsWithLabelsAndPips);
    labelsView.setOptions(labelsOptionsFull);

    view.render(document.body);
    view.renderPlugin({ plugin: 'labels', pluginView: labelsView });
  });

  test('labels rendered correctly', () => {
    const slider = document.querySelector('.jquery-slider');
    const labelsScale = document.querySelector('.jquery-slider-labels-scale');
    const labels = document.querySelectorAll('.jquery-slider-label');
    const pips = document.querySelectorAll('.jquery-slider-pip');

    expect(labelsScale.className).toBe(
      'jquery-slider-labels-scale jquery-slider-labels-scale-horizontal',
    );

    expect(labels.length).toBe(11);
    expect(labels[0].className).toBe(
      'jquery-slider-label jquery-slider-label-horizontal',
    );

    expect(pips.length).toBe(11);
    expect(pips[0].className).toBe(
      'jquery-slider-pip jquery-slider-pip-horizontal',
    );

    expect(slider.contains(labelsScale)).toBeTruthy();

    for (
      let i = 0, value = labelsOptionsFull.min;
      i < labels.length;
      i += 1, value += labelsOptionsFull.step
    ) {
      expect(labelsScale.contains(labels[i])).toBeTruthy();
      expect(labels[i].contains(pips[i])).toBeTruthy();
      expect(extractValue(labels[i].innerHTML)).toBe(
        String(labelsOptionsFull.valueFunc(value)),
      );
    }
  });
});
