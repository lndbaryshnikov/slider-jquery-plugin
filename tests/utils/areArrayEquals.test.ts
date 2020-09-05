import areArraysEqual from '../../src/utils/areArraysEqual';

describe('areArrayEquals util tests', () => {
  test('return true when simple arrays are equal', () => {
    const firstArray = [1, 2, 'string', 5];
    const secondArray = [1, 2, 'string', 5];

    expect(areArraysEqual(firstArray, secondArray)).toBeTruthy();
  });

  test('return true when nested arrays are equal', () => {
    const firstArray = [1, 2, 'string', [1, 2, undefined], null];
    const secondArray = [1, 2, 'string', [1, 2, undefined], null];

    expect(areArraysEqual(firstArray, secondArray)).toBeTruthy();
  });

  test('return false when simple arrays are not equal', () => {
    const firstArray = [1, 2, 'string', 5];
    const secondArray = [1, 2, 'string', 'null'];

    expect(areArraysEqual(firstArray, secondArray)).toBeFalsy();
  });

  test('return false when nested arrays are not equal', () => {
    const firstArray = [1, 2, 'string', [1, 2, '3'], null];
    const secondArray = [1, 2, 'string', [1, 2, '4'], null];

    expect(areArraysEqual(firstArray, secondArray)).toBeFalsy();
  });
});
