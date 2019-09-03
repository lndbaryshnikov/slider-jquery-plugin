import Presenter from "../../src/MVP modules/presenter/presenter";
import View from "../../src/MVP modules/view/view";
import Model from "../../src/MVP modules/model/model";

test("view property should return an object", () => {

    const view = new Presenter(new View(), new Model()).view;
    expect(typeof view).toBe('object');

});