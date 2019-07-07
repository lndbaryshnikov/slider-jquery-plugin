import Presenter from '../src/MVP modules/presenter/presenter'


describe('Presenter', () => {

    it("getView method", () => {

        const view = new Presenter().view;
        expect(view).to.be.an('object');

    });
});