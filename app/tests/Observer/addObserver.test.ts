import Observer from '../../src/plugin/Observer/Observer';

describe('addObserver method', () => {
  test('observers are added in list', () => {
    const observer = new Observer();

    observer.addObserver((error: string): string => error);

    expect(observer.observers.length).toBe(1);
  });

  test('throws an error when observer is not a function', () => {
    const test = (): void => {
      new Observer().addObserver('Hello!' as unknown as Function);
    };

    expect(test).toThrow('Observer must be a function');
  });

  test('throws an error when observer already in the list', () => {
    const makeTwoObserversTestFunction = (
      first: Function,
      secondFunc: Function = first,
    ): Function => (): void => {
      const observer = new Observer();

      observer.addObserver(first);
      observer.addObserver(secondFunc);
    };

    expect(
      makeTwoObserversTestFunction(() => 'hello', (x: string) => x),
    ).not.toThrow('Observer already in the list');

    expect(
      makeTwoObserversTestFunction(() => 'hello'),
    ).toThrow('Observer already in the list');
  });
});
