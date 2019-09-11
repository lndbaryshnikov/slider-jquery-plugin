import Observer from "../../src/MVP modules/Observer";

describe("notifyObservers", () => {
    test("notifyObserver works", () => {

        const observer = new Observer();

        const mock_1 = jest.fn();
        const mock_2 = jest.fn();
        const mock_3 = jest.fn();

        observer.addObserver( (x: number) => mock_1(x + 1) );
        observer.addObserver( (x: number) => mock_2(x + 2) );
        observer.addObserver( (x: number) => mock_3(x + 3) );

        observer.notifyObservers(3);

        expect(mock_1).toHaveBeenCalledWith(4);
        expect(mock_2).toHaveBeenCalledWith(5);
        expect(mock_3).toHaveBeenCalledWith(6);
    });
});