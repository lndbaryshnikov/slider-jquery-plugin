import { expect } from 'chai';

import Presenter from '../src/MVP modules/presenter/presenter'
import View from '../src/MVP modules/view/view'
import Model from "../src/MVP modules/model/model";

describe('Presenter', () => {
    it("view property should return an object", () => {
        const view = new Presenter(new View(), new Model()).view;

        expect(view).to.be.an('object');

    });
});