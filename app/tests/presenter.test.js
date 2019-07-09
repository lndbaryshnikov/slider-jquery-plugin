//import {expect} from 'chai';

import Presenter from '../src/MVP modules/presenter/presenter'
import View from '../src/MVP modules/view/view'

describe('Presenter', () => {

    it("getView method", () => {

        const view = new Presenter(new View()).view;
        expect(view).to.be.an('object');

    });
});