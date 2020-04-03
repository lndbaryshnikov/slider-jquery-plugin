import Observer from '../../src/plugin/Observer/Observer';

describe('addObserver method', () => {
  test('addObserver method works', () => {
    const observer = new Observer();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    observer.addObserver(() => {});

    expect(observer.observers.length).toBe(1);
  });

  test('throws an error when observer is not a function', () => {
    const test = () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      new Observer().addObserver('Hello!');
    };

    expect(test).toThrow('Observer must be a function');
  });

  test('throws an error when observer already in the list', () => {
    const makeFuncForTestErrors = (
      firstFunc: Function,
      secondFunc: Function = firstFunc,
      // eslint-disable-next-line func-names
    ): Function => function (): void {
      const observer = new Observer();

      observer.addObserver(firstFunc);
      observer.addObserver(secondFunc);
    };

    expect(
      makeFuncForTestErrors(
        () => {
          console.log('hello');
        },
        () => {},
      ),
    ).not.toThrow('Observer already in the list');

    expect(
      makeFuncForTestErrors(() => {
        console.log('hello');
      }),
    ).toThrow('Observer already in the list');

    expect(makeFuncForTestErrors(() => {})).toThrow(
      'Observer already in the list',
    );
  });
});
