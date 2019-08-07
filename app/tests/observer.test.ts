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


            const func_1 = () => { console.log('hello'); };
            const func_2 = () => { console.log(); };

            const testAddObserverError = (func_1: Function, func_2: Function = func_1): Function => {

                return function() {
                    const observer = new Observer();

                    observer.addObserver(func_1);
                    observer.addObserver(func_2);
                }
            };

            expect(testAddObserverError(func_1, func_2)).to.not.throw("Observer already in the list");
            expect(testAddObserverError(func_1)).to.throw("Observer already in the list");
            expect(testAddObserverError(func_2)).to.throw("Observer already in the list");
        });
    });

    describe("removeObserver method", () => {
        it("removeObserver method works", () => {
           // expect().();
        });
    })
});