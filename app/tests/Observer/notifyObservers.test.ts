import Observer from '../../src/plugin/Observer/Observer';

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
