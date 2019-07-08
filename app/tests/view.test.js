import Presenter from '../src/MVP modules/presenter/presenter'
import View from '../src/MVP modules/view/view'
const view = new View();

describe('View', () => {
   
    it("getHtml method", () => {

        expect(view.html).to.be.a('function');
    });
});