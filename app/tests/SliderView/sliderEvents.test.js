// import puppeteer from "puppeteer";
// import Presenter from "../../src/MVP modules/presenter/presenter";
// import View from "../../src/MVP modules/view/view";
// import Model from "../../src/MVP modules/model/model";
//
// describe("slider events", () => {
//     let browser, page;
//
//     beforeAll(async () => {
//         browser = await puppeteer.launch();
//         page = await browser.newPage();
//         await page.addScriptTag({path: 'node_modules/jquery/dist/jquery.min.js'});
//     });
//
//     afterAll(() => {
//         browser.close();
//     });
//
//     test("move jquery-slider-handle to specific coordinates inside the slider", async () => {
//
//
//         page.evaluate((strPresenter, strView, strModel) => {
//             eval("window.P = " + strPresenter);
//             eval("window.V = " + strView);
//             eval("window.M = " + strModel);
//
//             const presenter = new P(new V(), new M());
//
//             document.body.append(presenter.view.html[0]);
//
//         }, Presenter.toString(), View.toString(), Model.toString());
//
//         const size = await page.evaluate(() => {
//             const slider = document.getElementsByClassName('jquery-slider')[0];
//
//             const {top, bottom, left, right, width, height} = slider.getBoundingClientRect();
//
//             return {top, bottom, left, right, width, height};
//             // return slider;
//         });
//
//         expect(size).toBe(300);

        // const sliderCoords = await page.evaluate(() =>  {
        //     // document.body.append(presenter.view.html);
        //
        //     const slider = document.getElementsByClassName('jquery-slider')[0];
        //     console.log(slider);
        //
        //     const {top, bottom, left, right, width, height} = slider.getBoundingClientRect();
        //
        //     return {top, bottom, left, right, width, height};
        //
        // });
        //
        //
        // const sliderMiddleLeft = sliderCoords.left + sliderCoords.width/2;
        //
        // const handleCoords = await page.evaluate(() => {
        //     const handle = document.getElementsByClassName('.jquery-slider-handle')[0];
        //
        //     const {top, bottom, left, right, width, height} = handle.getBoundingClientRect();
        //
        //     return {top, bottom, left, right, width, height};
        //
        // } );
        //
        // const newHandleCoords = moveHandleToCertainCoords(sliderMiddleLeft);
        //
        // const newCoords = {
        //   top: newHandleCoords.top,
        //   left: newHandleCoords.left
        // };
        // const testCoords = {
        //   top: handleCoords.top,
        //   left: sliderMiddleLeft
        // };
        //
        // //expect(newCoords).toEqual(testCoords);
        // expect(testCoords).toEqual(0);
        //
        // presenter.view.html[0].remove();

    // }, 30000);

    // test("handle stays within the slider when the cursor goes outside", () => {
    //     const app = createInstance();
    //
    //     app.createDom();
    //
    //     const slider = $('.jquery-slider')[0];
    //     const sliderCoords = getCoords(slider);
    //
    //     const newHandleCoordsLeft = moveHandleToCertainCoords(sliderCoords.left - 10);
    //
    //     const newLeft_1 = newHandleCoordsLeft.left - sliderCoords.left;
    //
    //     const newHandleCoordsRight = moveHandleToCertainCoords(sliderCoords.right + 10);
    //
    //     const newLeft_2 = newHandleCoordsRight.left - sliderCoords.left;
    //     const rightEdge = sliderCoords.width - newHandleCoordsRight.width;
    //
    //
    //     expect(newLeft_1).toBe(0);
    //     expect(newLeft_2).toBe(rightEdge);
    //
    //     app.removeDom();
    // });
// });