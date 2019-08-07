import Observer from "../src/MVP modules/observer";

import {expect} from 'chai';

describe("Observer", () => {
   it("addObserver method", () => {
       const observer = new Observer();

       observer.addObserver(function(){});

       expect(observer.observers.length).to.equal(1);
   });
});