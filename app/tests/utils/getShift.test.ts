import getShift from '../../src/utils/getShift';

describe('getShift util tests', () => {
  test('util returns correct value', () => {
    const eventMock = {
      pageX: 100,
      pageY: 200,
    } as unknown as MouseEvent;

    const element = document.createElement('div');
    document.body.append(element);

    const shift = getShift({ element, event: eventMock });

    expect(shift).toEqual({
      x: 100,
      y: 200,
    });
  });
});
