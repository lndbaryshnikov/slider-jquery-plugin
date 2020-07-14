import MainView from '../../../src/plugin/View/MainView';
import Model from '../../../src/plugin/Model/Model';
import { Options, UserOptions } from '../../../src/plugin/Model/modelOptions';
import { Coords } from '../../../src/utils/getCoords';
import { horizontalSliderCoords, verticalSliderCoords } from '../../mocks/mockCoords';

describe('MainView tests', () => {
  let view: MainView;
  let root: HTMLDivElement;
  let coordsSpy: jest.SpyInstance;
  const defaults = Model.defaultOptions;

  const switchCoordsTo = (orientation: Options['orientation']): void => {
    const coords = orientation === 'horizontal' ? horizontalSliderCoords : verticalSliderCoords;
    coordsSpy = jest.spyOn(view, 'getCoords')
      .mockImplementation((): Coords => coords);
  };

  const getOptions = (options?: UserOptions): Options => (
    options ? { ...defaults, ...options } : { ...defaults }
  );

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);

    view = new MainView();
    switchCoordsTo('horizontal');
  });

  afterEach(() => {
    root.remove();

    const slider = document.querySelector('.jquery-slider');
    if (slider) slider.remove();
  });

  describe('Handles rendering depends on range', () => {
    const defaultsRangeMin = getOptions({ range: 'min' });
    const defaultsRangeTrue = getOptions({ range: true, value: [0, 100] });
    const defaultsRangeFalse = getOptions({ range: false });

    test('one firstHandle rendered if range is false and min', () => {
      view.setOptions(defaultsRangeFalse);
      view.render(root);
      expect(document.querySelectorAll('.jquery-slider__handle').length).toBe(1);

      view.setOptions(defaultsRangeMin);
      expect(document.querySelectorAll('.jquery-slider__handle').length).toBe(1);
    });

    test('two handles rendered when range is true', () => {
      view.setOptions(defaultsRangeTrue);
      view.render(root);

      expect(document.querySelectorAll('.jquery-slider__handle').length).toBe(2);
    });
  });

  test('render method - elements are rendered', () => {
    view.setOptions(defaults);
    view.render(root);

    expect(typeof view.html).toBe('object');

    const { slider, range, firstHandle } = view.html;

    expect(slider.tagName).toBe('DIV');
    expect(range.html.tagName).toBe('DIV');
    expect(firstHandle.html.tagName).toBe('DIV');

    expect(slider.contains(range.html)).toBe(true);
    expect(slider.contains(firstHandle.html)).toBe(true);
  });

  test('destroy method works correctly', () => {
    view.setOptions(defaults);
    view.render(root);
    view.destroy();

    expect(document.querySelectorAll('div').length).toBe(0);
    expect(document.querySelector('.jquery-slider')).toBe(null);
    expect(document.querySelector('.jquery-slider-range')).toBe(null);
    expect(document.querySelector('.jquery-slider-handle')).toBe(null);

    expect(() => { view.destroy(); }).not.toThrow();
  });

  describe('refreshValue method with its private methods', () => {
    let valueChangedCallbackSpy: jest.Mock;

    const testRefreshValueMethod = ({ coordinate, expectedValue }: {
      coordinate: number; expectedValue: number | number[];
    }): void => {
      view.refreshValue({ handleCoordinate: coordinate });
      expect(valueChangedCallbackSpy).toBeCalledWith(expectedValue);
    };

    beforeEach(() => {
      valueChangedCallbackSpy = jest.fn();

      view.setOptions(defaults);
      view.whenValueChanged(valueChangedCallbackSpy);
    });

    test('value equals min or max when coordinate is out of slider border', () => {
      testRefreshValueMethod({ coordinate: 330, expectedValue: 100 });
      testRefreshValueMethod({ coordinate: 18, expectedValue: 0 });

      view.setOptions(getOptions({ orientation: 'vertical' }));
      switchCoordsTo('vertical');

      testRefreshValueMethod({ coordinate: 410, expectedValue: 100 });
      testRefreshValueMethod({ coordinate: 90, expectedValue: 0 });
    });

    test('value is correct when coordinate is not out of borders', () => {
      testRefreshValueMethod({ coordinate: 170, expectedValue: 50 });
      testRefreshValueMethod({ coordinate: 50, expectedValue: 10 });

      view.setOptions(getOptions({ orientation: 'vertical' }));
      switchCoordsTo('vertical');

      testRefreshValueMethod({ coordinate: 250, expectedValue: 50 });
      testRefreshValueMethod({ coordinate: 130, expectedValue: 10 });
    });

    describe('getClosestHandleNumber method is correct', () => {
      const optionsWithRangeTrue = getOptions({
        range: true,
        value: [10, 90],
      });
      const horizontalFirstHandleCoords = {
        width: 6,
        height: 6,
        left: 47,
        right: 53,
        top: 200,
        bottom: 206,
      };
      const verticalFirstHandleCoords = {
        width: 6,
        height: 6,
        left: 20,
        right: 26,
        top: 367,
        bottom: 373,
      };

      test('works when orientation is horizontal', () => {
        view.setOptions(optionsWithRangeTrue);
        view.render(root);

        const { firstHandle, secondHandle } = view.html;
        jest.spyOn(firstHandle, 'getCoords').mockImplementation(
          (): Coords => horizontalFirstHandleCoords,
        );
        jest.spyOn(secondHandle, 'getCoords').mockImplementation(
          (): Coords => ({
            ...horizontalFirstHandleCoords,
            left: 287,
            right: 293,
          }),
        );

        testRefreshValueMethod({ coordinate: 110, expectedValue: [30, 90] });
        testRefreshValueMethod({ coordinate: 230, expectedValue: [10, 70] });
        testRefreshValueMethod({ coordinate: 20, expectedValue: [0, 90] });
        testRefreshValueMethod({ coordinate: 320, expectedValue: [10, 100] });
      });

      test('works when orientation is vertical', () => {
        view.setOptions({ ...optionsWithRangeTrue, orientation: 'vertical' });
        coordsSpy.mockImplementation(() => verticalSliderCoords);
        view.render(root);

        const { firstHandle, secondHandle } = view.html;
        jest.spyOn(firstHandle, 'getCoords').mockImplementation(
          (): Coords => verticalFirstHandleCoords,
        );
        jest.spyOn(secondHandle, 'getCoords').mockImplementation(
          (): Coords => ({
            ...verticalFirstHandleCoords,
            top: 127,
            bottom: 133,
          }),
        );

        testRefreshValueMethod({ coordinate: 190, expectedValue: [10, 70] });
        testRefreshValueMethod({ coordinate: 310, expectedValue: [30, 90] });
        testRefreshValueMethod({ coordinate: 100, expectedValue: [10, 100] });
        testRefreshValueMethod({ coordinate: 400, expectedValue: [0, 90] });
      });
    });
  });

  test('setTooltips method - tooltips set correctly', () => {
    const defaultsWithoutTooltip = getOptions();
    const defaultsWithTooltip = getOptions({ tooltip: true });
    const defaultsWithTwoTooltips = getOptions({
      tooltip: true,
      range: true,
      value: [0, 100],
    });

    const hasTooltips = (): boolean => {
      const handles = document.querySelectorAll('.jquery-slider__handle');
      const tooltips = document.querySelectorAll('.jquery-slider__tooltip');
      const handlesArray = Array.from(handles);
      const doesNotContain = handlesArray.some((handle, index) => (
        !handle.contains(tooltips[index])
      ));

      return !doesNotContain;
    };

    view.setOptions(defaultsWithoutTooltip);
    view.render(root);
    expect(hasTooltips()).toBeFalsy();

    view.setOptions(defaultsWithTooltip);
    expect(hasTooltips()).toBeTruthy();

    view.setOptions(defaultsWithTwoTooltips);
    expect(hasTooltips()).toBeTruthy();
  });

  test('styles are successfully set', () => {
    const styles = {
      slider: 'orange',
      range: 'orange',
      handle: 'orange',
      tooltip: 'orange',
    };

    view.setStyles(styles);
    view.setOptions(getOptions({ tooltip: true }));
    view.render(root);

    const checkStyles = (elementName: string): void => {
      expect(!document.querySelector(`${elementName} ${elementName}_color_orange`)).toBeTruthy();
    };

    checkStyles('jquery-slider');
    checkStyles('jquery-slider__handle');
    checkStyles('jquery-slider__range');
    checkStyles('jquery-slider__tooltip');
  });
});
