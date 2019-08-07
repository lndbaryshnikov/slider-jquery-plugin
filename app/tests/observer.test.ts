import Observer from "../src/MVP modules/observer";

import {expect} from 'chai';

describe("Observer", () => {
    describe("addObserver method", () => {
        it("addObserver method works", () => {
           const observer = new Observer();

           observer.addObserver(function(){});

           expect(observer.observers.length).to.equal(1);
        });

        it("throws an error when observer is not a function", () => {

            const test = () => {
                //@ts-ignore
                (new Observer()).addObserver("Hello!");
            };

            expect(test).to.throw("Observer must be a function");
        });

        it("throws an errpr when observer already in the list", () => {


            const observer_1 = () => { console.log('hello'); };
            const observer_2 = () => {};

            const createFuncForTestErrors = (func_1: Function, func_2: Function = func_1): Function => {

                return function() {
                    const observer = new Observer();

                    observer.addObserver(func_1);
                    observer.addObserver(func_2);
                }
            };

            expect(createFuncForTestErrors(observer_1, observer_2)).to.not.throw("Observer already in the list");
            expect(createFuncForTestErrors(observer_1)).to.throw("Observer already in the list");
            expect(createFuncForTestErrors(observer_2)).to.throw("Observer already in the list");
        });
    });

    describe("removeObserver method", () => {
        it("removeObserver method works", () => {

            const observer_1 = () => {
                const thing = 5;
                console.log(thing);
            };
            const observer_2 = () => {
                const thing = 1;
                console.log(thing);
            };

            const observer = new Observer();

            observer.addObserver(function () {
            });
            observer.addObserver(function () {
                console.log(5)
            });
            observer.addObserver(function () {
                const item = "item";
            });

            observer.removeObserver(function () {
                console.log(5)
            });

            expect(observer.observers.length).to.equal(2);
            expect(observer.observers).to.deep.equal([
                function () {
                },
                function () {
                    const item = "item";
                }
            ]);
        });

        it("throws error when observer is not found in the list", () => {
            const observer = new Observer();

            observer.addObserver(function () {
                let y = 1;
                y++;
            });
            observer.addObserver(function () {
                console.log("hello")
            });

            const createFuncForTestError = () => {
                observer.removeObserver(function () {
                    let x = 1;
                    x++;
                })
            };

            expect(createFuncForTestError).to.throw("Could not find observer in list of observers");
        });
    });
});