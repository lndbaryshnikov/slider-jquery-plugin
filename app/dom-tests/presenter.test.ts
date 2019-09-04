import { expect } from 'chai';

import SliderPresenter from '../src/MVP modules/Slider/presenter'
import SliderView from '../src/MVP modules/Slider/_view'
import SliderModel from "../src/MVP modules/Slider/_model";

describe('SliderPresenter', () => {
    it("_view property should return an object", () => {
        const view = new SliderPresenter(new SliderView(), new SliderModel())._view;

        expect(view).to.be.an('object');

    });
});