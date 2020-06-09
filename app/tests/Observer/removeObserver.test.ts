import Observer from '../../src/plugin/Observer/Observer';

describe('removeObserver method', () => {
  it('observer removed', () => {
    const observer = new Observer();

    observer.addObserver((str: string) => `Hello, ${str}`);
    observer.addObserver((str: string) => str);
    observer.addObserver((str: string) => `I'm ${str}`);

    expect(observer.observers.length).toBe(3);

    observer.removeObserver((str: string) => str);

    expect(observer.observers.length).toBe(2);

    const [firstObserver, secondObserver] = observer.observers;

    expect([
      firstObserver.toString(),
      secondObserver.toString(),
    ]).toEqual([
      ((str: string): string => `Hello, ${str}`).toString(),
      ((str: string): string => `I'm ${str}`).toString(),
    ]);
  });

  it('throws error when observer is not found in the list', () => {
    const observer = new Observer();

    observer.addObserver((y: number) => y + 1);
    observer.addObserver((y: number) => y);

    const createFuncForTestError = (): void => {
      observer.removeObserver((y: number) => y - 1);
    };

    expect(createFuncForTestError).toThrow(
      'Could not find observer in list of observers',
    );
  });
});
