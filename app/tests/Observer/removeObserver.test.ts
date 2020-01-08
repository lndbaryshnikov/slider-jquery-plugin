import Observer from '../../src/MVP modules/Observer';

describe('removeObserver method', () => {
  it('removeObserver method works', () => {
    const observer = new Observer();

    observer.addObserver((str: string) => `Hello, ${str}`);
    observer.addObserver((str: string) => { console.log(str); });
    observer.addObserver((str: string) => `I'm ${str}`);

    expect(observer.observers.length).toBe(3);

    observer.removeObserver((str: string) => { console.log(str); });

    expect(observer.observers.length).toBe(2);

    expect([observer.observers[0].toString(), observer.observers[1].toString()]).toEqual([
      ((str: string) => `Hello, ${str}`).toString(),
      ((str: string) => `I'm ${str}`).toString(),
    ]);
  });

  it('throws error when observer is not found in the list', () => {
    const observer = new Observer();

    observer.addObserver((y: number) => y + 1);
    observer.addObserver((y: number) => { console.log(y); });

    const createFuncForTestError = (): void => {
      observer.removeObserver((y: number) => y - 1);
    };

    expect(createFuncForTestError).toThrow('Could not find observer in list of observers');
  });
});
