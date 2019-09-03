import View from "../../src/MVP modules/view/view";

test("should have html property", () => {
    const view = new View();

    expect(!!view.html).toBe(true);
});