// import Observer from "../src/MVP modules/observer";
//
// import {expect} from 'chai';
// import sinon from '../../node_modules/sinon/pkg/sinon-esm.js';
//
// describe("Observer", () => {
//     describe("addObserver method", () => {
//         it("addObserver method works", () => {
//            const observer = new Observer();
//
//            observer.addObserver(function(){});
//
//            expect(observer.observers.length).to.equal(1);
//         });
//
//         it("throws an error when observer is not a function", () => {
//
//             const test = () => {
//                 //@ts-ignore
//                 (new Observer()).addObserver("Hello!");
//             };
//
//             expect(test).to.throw("Observer must be a function");
//         });
//
//         it("throws an errpr when observer already in the list", () => {
//             const createFuncForTestErrors = (func_1: Function, func_2: Function = func_1): Function => {
//
//                 return function() {
//                     const observer = new Observer();
//
//                     observer.addObserver(func_1);
//                     observer.addObserver(func_2);
//                 }
//             };
//
//             expect(createFuncForTestErrors( () => { console.log('hello'); }, () => {} )).to.not.throw("Observer already in the list");
//             expect(createFuncForTestErrors( () => { console.log('hello'); } )).to.throw("Observer already in the list");
//             expect(createFuncForTestErrors( () => {} )).to.throw("Observer already in the list");
//         });
//     });
//
//     describe("removeObserver method", () => {
//         it("removeObserver method works", () => {
//             const observer = new Observer();
//
//             observer.addObserver(function () {});
//
//             observer.addObserver(function () {
//                 console.log(5);
//             });
//
//             observer.addObserver(function () { const item = "item"; });
//
//             observer.removeObserver(function () {
//                 console.log(5);
//             });
//
//             expect(observer.observers.length).to.equal(2);
//             expect([observer.observers[0].toString(), observer.observers[1].toString()]).to.deep.equal([
//                 function () {}.toString(),
//                 function () { const item = "item"; }.toString()
//             ]);
//         });
//
//         it("throws error when observer is not found in the list", () => {
//             const observer = new Observer();
//
//             observer.addObserver(function () {
//                 let y = 1;
//                 y++;
//             });
//             observer.addObserver(function () {
//                 console.log("hello")
//             });
//
//             const createFuncForTestError = () => {
//                 observer.removeObserver(function () {
//                     let x = 1;
//                     x++;
//                 })
//             };
//
//             expect(createFuncForTestError).to.throw("Could not find observer in list of observers");
//         });
//     });
//
//     describe("notifyObservers", () => {
//         it("notifyObserver works", () => {
//
//             const observer1 = function () {
//                 let y = 1;
//                 y++;
//             };
//
//             const observer2 = function () {
//                 console.log("hello")
//             };
//
//             const observer3 = function () {
//                 let x = 1;
//                 x++;
//             };
//
//             const createSpies = (...functions: Function[]): any[] => {
//                 const spies = [];
//
//                 for (let i = 0; i < functions.length; i++) {
//                     let spy = sinon.spy(functions[i]);
//
//                     spies.push(spy);
//                 }
//
//                 return spies;
//             };
//
//             const spies = createSpies(observer1, observer2, observer3);
//
//             const observer = new Observer();
//
//             const addObservers = (observer: Observer, ...observers: Function[]): void => {
//                 for (let i = 0; i < observers.length; i++) {
//                     observer.addObserver(observers[i]);
//                 }
//             };
//
//             addObservers(observer, spies[0], spies[1], spies[2]);
//
//             observer.notifyObservers();
//
//             expect(spies[0].called).to.be.true;
//             expect(spies[1].called).to.be.true;
//             expect(spies[2].called).to.be.true;
//         });
//     })
// });