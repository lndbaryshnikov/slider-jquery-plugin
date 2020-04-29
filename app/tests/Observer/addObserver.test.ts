import Observer from '../../src/plugin/Observer/Observer';

describe('addObserver method', () => {
  test('addObserver method works', () => {
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
    const makeFuncForTestErrors = (
      firstFunc: Function,
      secondFunc: Function = firstFunc,
    ): Function => (): void => {
      const observer = new Observer();

      observer.addObserver(firstFunc);
      observer.addObserver(secondFunc);
    };

    expect(
      makeFuncForTestErrors(
        () => 'hello',
        (x: string) => x,
      ),
    ).not.toThrow('Observer already in the list');

    expect(
      makeFuncForTestErrors(() => 'hello'),
    ).toThrow('Observer already in the list');
  });
});
