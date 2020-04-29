import SliderLabelsView, {
  LabelOptions,
} from '../../src/plugin/SliderLabelsView/SliderLabelsView';

const extractValue = (value: string): string => value
  .replace(/\d+px/, '')
  .replace(/[<>="\\ a-z/\-:;]/gi, '');

describe('tooltip works correctly', () => {
  let labels: SliderLabelsView;
  let root: HTMLDivElement;
  let labelsOnDom: NodeListOf<Element>;

  const labelsOptionsFull: LabelOptions = {
    labels: true,
    pips: true,
    orientation: 'horizontal',
    min: 0,
    max: 10,
    step: 1,
    valueFunc: (value: number) => `${value}$`,
  };

  const labelsOptionsVertical = $.extend({}, labelsOptionsFull);
  labelsOptionsVertical.orientation = 'vertical';

  const labelsOptionsPipsFalse = $.extend({}, labelsOptionsFull);
  labelsOptionsPipsFalse.pips = false;

  const labelsOptionsLabelsFalse = $.extend({}, labelsOptionsFull);
  labelsOptionsLabelsFalse.labels = false;

  beforeEach(() => {
    root = document.createElement('div');
    root.style.width = '200px';
    root.style.height = '5px';
    root.style.margin = '100px';

    document.body.append(root);

    labels = new SliderLabelsView();
    labels.setOptions(labelsOptionsFull);

    labels.render(root);

    labelsOnDom = document.querySelectorAll('.jquery-slider-label');
  });

  afterEach(() => {
    root.remove();
  });

  test('complete label exists and contain pips', () => {
    const pipsOnDom = document.querySelectorAll('.jquery-slider-pip');

    labels.labels.forEach((label) => {
      expect(root.contains(label)).toBeTruthy();
    });

    for (let i = 0; i < pipsOnDom.length; i += 1) {
      expect(pipsOnDom[i]).not.toBe(null);
      expect(labelsOnDom[i].contains(pipsOnDom[i])).toBeTruthy();
    }
  });

  test("labels' values is correct", () => {
    for (
      let i = 0, value = labelsOptionsFull.min;
      i < labelsOnDom.length;
      i += 1, value += labelsOptionsFull.step
    ) {
      const label = labelsOnDom[i];
      const formattedValue = labelsOptionsFull.valueFunc(value);
      const inner = extractValue(label.innerHTML);

      expect(inner).toBe(formattedValue);
    }
  });

  test('remove methods', () => {
    labels.remove();

    expect(labels.labels).toBeTruthy();

    labels.labels.forEach((label) => {
      expect(root.contains(label)).toBe(false);
    });
  });

  test('destroy method works', () => {
    labels.destroy();

    expect(labels.labels).toBe(null);
  });

  test('setClasses', () => {
    expect(labelsOnDom[0].className).toBe(
      'jquery-slider-label jquery-slider-label-horizontal',
    );

    expect(labelsOnDom[0].children[0].className).toBe(
      'jquery-slider-pip jquery-slider-pip-horizontal',
    );

    labels.setOptions(labelsOptionsVertical);

    labelsOnDom = document.querySelectorAll('.jquery-slider-label');

    expect(labelsOnDom[0].className).toBe(
      'jquery-slider-label jquery-slider-label-vertical',
    );
    expect(labelsOnDom[0].children[0].className).toBe(
      'jquery-slider-pip jquery-slider-pip-vertical',
    );
  });

  test('when pips are false', () => {
    expect(!!labelsOnDom[0].querySelector('.jquery-slider-pip')).toBeTruthy();
    const value0 = extractValue(labelsOnDom[0].innerHTML);

    expect(value0).toBe('0$');

    labels.setOptions(labelsOptionsPipsFalse);
    labelsOnDom = document.querySelectorAll('.jquery-slider-label');

    expect(!!labelsOnDom[0].querySelector('.jquery-slider-pip')).toBeFalsy();
  });

  test('when labels are false', () => {
    labels.setOptions(labelsOptionsLabelsFalse);
    labelsOnDom = document.querySelectorAll('.jquery-slider-label');

    expect(labelsOnDom.length).not.toBe(0);
    expect(labelsOnDom[0].querySelector('.jquery-slider-pip')).not.toBe(null);

    const value = extractValue(labelsOnDom[0].innerHTML);

    expect(value).toBe('');
  });
});
