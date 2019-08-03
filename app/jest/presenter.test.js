//import {expect} from 'chai';

import Presenter from '../src/MVP modules/presenter/presenter'
import View from '../src/MVP modules/view/view'

describe('Presenter', () => {

    test("view property should return an object", () => {

        const view = new Presenter(new View()).view;
        expect(typeof view).toBe('object');

    });
});