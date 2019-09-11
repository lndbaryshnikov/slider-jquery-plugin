import Observer from "../../src/MVP modules/Observer";

describe("addObserver method", () => {
    test("addObserver method works", () => {
       const observer = new Observer();

       observer.addObserver(function(){});

       expect(observer.observers.length).toBe(1);
    });

    test("throws an error when observer is not a function", () => {

        const test = () => {
            // @ts-ignore
            (new Observer()).addObserver("Hello!");
        };

        expect(test).toThrow("Observer must be a function");
    });

    test("throws an error when observer already in the list", () => {
        const createFuncForTestErrors = (func_1: Function, func_2: Function = func_1): Function => {

            return function() {
                const observer = new Observer();

                observer.addObserver(func_1);
                observer.addObserver(func_2);
            }
        };

        expect(createFuncForTestErrors( () => { console.log('hello'); },
            () => {} )).not.toThrow("Observer already in the list");

        expect(createFuncForTestErrors( () => { console.log('hello'); } ))
            .toThrow("Observer already in the list");

        expect(createFuncForTestErrors( () => {} ))
            .toThrow("Observer already in the list");
    });
});