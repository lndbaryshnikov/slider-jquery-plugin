import Observer from '../../../src/plugin/components/Observer/Observer';

describe('Observer tests', () => {
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

  describe('notifyObservers', () => {
    test('observers called', () => {
      const observer = new Observer();

      const firstMock = jest.fn();
      const secondMock = jest.fn();
      const thirdMock = jest.fn();

      observer.addObserver((x: number) => firstMock(x + 1));
      observer.addObserver((x: number) => secondMock(x + 2));
      observer.addObserver((x: number) => thirdMock(x + 3));

      observer.notifyObservers(3);

      expect(firstMock).toHaveBeenCalledWith(4);
      expect(secondMock).toHaveBeenCalledWith(5);
      expect(thirdMock).toHaveBeenCalledWith(6);
    });
  });

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
});
