import HandleView, { NewHandlePositionData } from '../../../src/plugin/View/HandleView';
import TooltipView from '../../../src/plugin/View/TooltipView';
import { Options } from '../../../src/plugin/Model/modelOptions';
import { horizontalSliderCoords, verticalSliderCoords, cursorShiftMock } from './mockCoords';

describe('HandleView tests', () => {
  let root: HTMLDivElement;
  let handle: HandleView;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);

    handle = new HandleView('first');
  });

  afterEach(() => {
    root.remove();
  });

  test('renderTooltip method rendering tooltip', () => {
    handle.stickTo(root);
    expect(handle.doesContainTooltip()).toBeFalsy();

    const tooltip = new TooltipView();
    handle.renderTooltip(tooltip);
    expect(handle.doesContainTooltip()).toBeTruthy();
  });

  test('get handleNumber method returns correct number', () => {
    expect(handle.handleNumber).toBe('first');
  });

  test('getCursorShift method returns correct shift', () => {
    handle.stickTo(root);

    const eventMock = {
      pageX: 100,
      pageY: 200,
    } as unknown as MouseEvent;

    expect(handle.getCursorShift(eventMock)).toEqual({
      x: 100,
      y: 200,
    });
  });

  test('isEventTarget method returns correct value', () => {
    handle.stickTo(root);

    const domHandle = document.querySelector('.jquery-slider__handle');
    const eventMock = {
      target: domHandle,
    } as unknown as MouseEvent;

    expect(handle.isEventTarget(eventMock.target)).toBeTruthy();
  });

  describe('validateNewCoordinate method returns correct handle coordinate', () => {
    const getValidationObject = ({ orientation, mouseX, mouseY }: {
    orientation: Options['orientation'];
    mouseX: number;
    mouseY: number;
  }): NewHandlePositionData => ({
      orientation,
      availableSpace: (
        orientation === 'horizontal'
          ? horizontalSliderCoords
          : verticalSliderCoords
      ),
      cursorShift: cursorShiftMock,
      mouseCoords: { mouseX, mouseY },
    });

    test('method works correctly with horizontal orientation', () => {
      let newHandleCoordinate = handle.validateNewCoordinate(
        getValidationObject({
          orientation: 'horizontal',
          mouseX: 172,
          mouseY: 198,
        }),
      );

      expect(newHandleCoordinate).toBe(170);

      newHandleCoordinate = handle.validateNewCoordinate(
        getValidationObject({
          orientation: 'horizontal',
          mouseX: 10,
          mouseY: 198,
        }),
      );

      expect(newHandleCoordinate).toBe(20);

      newHandleCoordinate = handle.validateNewCoordinate(
        getValidationObject({
          orientation: 'horizontal',
          mouseX: 350,
          mouseY: 198,
        }),
      );

      expect(newHandleCoordinate).toBe(320);
    });

    test('method works correctly with vertical orientation', () => {
      let newHandleCoordinate = handle.validateNewCoordinate(
        getValidationObject({
          orientation: 'vertical',
          mouseX: 20,
          mouseY: 251,
        }),
      );

      expect(newHandleCoordinate).toBe(250);

      newHandleCoordinate = handle.validateNewCoordinate(
        getValidationObject({
          orientation: 'vertical',
          mouseX: 20,
          mouseY: 80,
        }),
      );

      expect(newHandleCoordinate).toBe(100);

      newHandleCoordinate = handle.validateNewCoordinate(
        getValidationObject({
          orientation: 'vertical',
          mouseX: 20,
          mouseY: 450,
        }),
      );

      expect(newHandleCoordinate).toBe(400);
    });
  });

  test('allowMovingWithinSpace binds two listeners', () => {
    const addListenerMethodSpy = jest.spyOn(document, 'addEventListener');

    handle.allowMovingWithinSpace({
      orientation: 'horizontal',
      availableSpace: horizontalSliderCoords,
      cursorShift: cursorShiftMock,
    });

    expect(addListenerMethodSpy).toBeCalledTimes(2);
    expect(addListenerMethodSpy.mock.calls[0][0]).toBe('mousemove');
    expect(addListenerMethodSpy.mock.calls[1][0]).toBe('mouseup');

    addListenerMethodSpy.mockRestore();
  });
});
