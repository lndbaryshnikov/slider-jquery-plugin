import LabelsView, { LabelOptions } from '../../../src/plugin/View/LabelsView';
import { Options } from '../../../src/plugin/Model/modelOptions';

const getOptions = (options?: Partial<LabelOptions>): LabelOptions => {
  const baseOptions: LabelOptions = {
    labels: true,
    pips: true,
    orientation: 'horizontal',
    min: 0,
    max: 10,
    step: 1,
  };

  return options ? { ...baseOptions, ...options } : baseOptions;
};

const getClassName = ({ element, orientation }: {
  element: 'label' | 'pip';
  orientation: Options['orientation'];
 }): string => {
  const mainClass = `jquery-slider__${element}`;

  return `${mainClass} ${mainClass}_orientation_${orientation}`;
};

const areLabelsCorrect = (labelsArray): boolean => (
  !labelsArray.some(
    (label, index) => {
      const labelClass = getClassName({ orientation: 'horizontal', element: 'label' });
      const pipClass = getClassName({ orientation: 'horizontal', element: 'pip' });

      return !(
        label.className === labelClass
          && (label.firstChild as HTMLElement).className === pipClass
          && label.lastChild.textContent === String(index)
      );
    },
  )
);

const rootCoords = {
  width: 500,
  height: 6,
  left: 20,
  right: 520,
  top: 200,
  bottom: 206,
};
const labelCoords = {
  width: 10,
  height: 15,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
const pipCoords = {
  width: 2,
  height: 5,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

describe('LabelsView tests', () => {
  let root: HTMLDivElement;
  let labels: LabelsView;
  let getRootCoordsMock: jest.SpyInstance;
  let getLabelCoordsMock: jest.SpyInstance;
  let getPipCoordsMock: jest.SpyInstance;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);
    labels = new LabelsView();

    getRootCoordsMock = jest.spyOn(labels, 'getRootCoords').mockImplementation(
      () => rootCoords,
    );
    getLabelCoordsMock = jest.spyOn(labels, 'getLabelCoords').mockImplementation(
      () => labelCoords,
    );
    getPipCoordsMock = jest.spyOn(labels, 'getPipCoords').mockImplementation(
      () => pipCoords,
    );
  });

  test('labels generated', () => {
    labels.setOptions(getOptions());

    const labelsGenerated = labels.labels;

    expect(labelsGenerated.length).toBe(11);
    expect(areLabelsCorrect(labelsGenerated)).toBeTruthy();
  });

  test('labels not generated when they are not required', () => {
    labels.setOptions(getOptions({ labels: false, pips: false }));

    expect(labels.labels).toBeFalsy();
  });

  test('labels state is correct', () => {
    expect(labels.state).toEqual({
      isRendered: false,
      isSet: false,
    });

    labels.setOptions(getOptions());

    expect(labels.state).toEqual({
      isRendered: false,
      isSet: true,
    });

    labels.render(root);

    expect(labels.state).toEqual({
      isRendered: true,
      isSet: true,
    });
  });

  test('labels rendered and removed without errors', () => {
    labels.setOptions(getOptions());
    labels.render(root);

    const domScale = document.querySelector('.jquery-slider__scale');
    const labelsArray = Array.from(domScale.children);

    expect(areLabelsCorrect(labelsArray)).toBeTruthy();
  });

  test('getCoords methods', () => {
    labels.setOptions(getOptions());
    labels.render(root);

    getRootCoordsMock.mockRestore();
    getLabelCoordsMock.mockRestore();
    getPipCoordsMock.mockRestore();
    const coords = {
      width: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };

    expect(labels.getRootCoords()).toEqual(coords);
    expect(labels.getLabelCoords(1)).toEqual(coords);
    expect(labels.getPipCoords(1)).toEqual(coords);
  });
});
