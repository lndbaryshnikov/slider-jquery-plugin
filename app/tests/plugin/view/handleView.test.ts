import HandleView from '../../../src/plugin/View/HandleView';
import TooltipView from '../../../src/plugin/View/TooltipView';

describe('HandleView tests', () => {
  let root: HTMLDivElement;
  let handle: HandleView;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.append(root);

    handle = new HandleView('first');
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
});
