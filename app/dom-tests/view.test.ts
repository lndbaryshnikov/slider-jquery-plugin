// import { expect } from 'chai';
// import SliderView from '../src/MVP modules/Slider/_view'
// import {getClassList, createInstance, moveHandleToCertainCoords} from "../src/functions/private/view.private";
// import {getDefaultOptions} from '../src/MVP modules/Slider/_model';
// import _getCoords from '../src/functions/common/_getCoords'
//
// //styles here:
// import '../src/styles/jquery-slider.scss'
// import '../src/styles/jquery-slider-range.scss'
// import '../src/styles/jquery-slider-handle.scss'
//
// const defaultClasses = getDefaultOptions.classes;
//
// describe('SliderView', () => {
//     it("should have html property", () => {
//         const view = new SliderView();
//
//         expect(!!view.html).to.be.true;
//
//     });
//
//     describe("setModel method for setting classes", () => {
//         it("set classes when main passes no classes in _model", () => {
//             const app = createInstance();
//             app.createDom();
//
//             expect(getClassList($('div'))).to.deep.equal(defaultClasses);
//
//             app.removeDom();
//         });
//
//         it("set classes when main adds extra class 'my-slider' to 'jquery-slider' class", () => {
//             const app = createInstance({
//                 classes: {
//                 'jquery-slider': 'my-slider'
//                 }
//             });
//
//             app.createDom();
//
//             const domClasses = getClassList($('div'));
//
//             const testClasses = Object.assign({}, defaultClasses);
//             testClasses["jquery-slider"] = 'my-slider';
//
//             expect($('.jquery-slider').hasClass('my-slider')).to.be.true;
//             expect(domClasses).to.deep.equal(testClasses);
//
//             app.removeDom();
//         });
//
//     });
//
//     describe("slider events", () => {
//         it("move jquery-slider-handle to specific coordinates inside the slider", () => {
//             const app = createInstance();
//             app.createDom();
//
//             const slider = $('.jquery-slider')[0];
//             const sliderCoords = _getCoords(slider);
//
//             const sliderMiddleLeft = sliderCoords.left + sliderCoords.width/2;
//
//             const handle = $('.jquery-slider-handle')[0];
//             const handleCoords = _getCoords(handle);
//
//             const newHandleCoords = moveHandleToCertainCoords(sliderMiddleLeft);
//
//             const newCoords = {
//               top: newHandleCoords.top,
//               left: newHandleCoords.left
//             };
//             const testCoords = {
//               top: handleCoords.top,
//               left: sliderMiddleLeft
//             };
//
//             expect(newCoords).to.deep.equal(testCoords);
//
//             app.removeDom();
//         });
//
//         it("handle stays within the slider when the cursor goes outside", () => {
//             const app = createInstance();
//             app.createDom();
//
//             const slider = $('.jquery-slider')[0];
//             const sliderCoords = _getCoords(slider);
//
//             const newHandleCoordsLeft = moveHandleToCertainCoords(sliderCoords.left - 10);
//
//             const newLeft_1 = newHandleCoordsLeft.left - sliderCoords.left;
//
//             const newHandleCoordsRight = moveHandleToCertainCoords(sliderCoords.right + 10);
//
//             const newLeft_2 = newHandleCoordsRight.left - sliderCoords.left;
//             const rightEdge = sliderCoords.width - newHandleCoordsRight.width;
//
//
//             expect(newLeft_1).to.equal(0);
//             expect(newLeft_2).to.equal(rightEdge);
//
//             app.removeDom();
//         });
//
//         it("range div behaviour when _options.range = min", () => {
//
//             const app = createInstance({range: "min"});
//             app.createDom();
//
//             const range = $(".jquery-slider-range")[0];
//             const rangeCoords = _getCoords(range);
//
//             const leftRangeCoords = {
//                 top: rangeCoords.top,
//                 left: rangeCoords.left
//             };
//
//             const slider = $('.jquery-slider')[0];
//             const sliderCoords = _getCoords(slider);
//
//             const expectedLeftRangeCoords = {
//                 top: sliderCoords.top,
//                 left: sliderCoords.left
//             };
//
//             expect(leftRangeCoords).to.equal(expectedLeftRangeCoords);
//
//             const shift = 0.5 * parseInt($(slider).css("width"));
//             const newHandleCoords = moveHandleToCertainCoords(sliderCoords.left + shift);
//
//             const newRangeCoords = _getCoords(range);
//
//             const newRightRangeCoords = {
//                 top: newRangeCoords.top,
//                 left: newRangeCoords.left + newRangeCoords.width
//             };
//
//             const expectedNewRightRangeCoords = {
//                 top: sliderCoords.top,
//                 left: newHandleCoords.left
//             };
//
//             const newLeftRangeCoords = {
//                 top: newRangeCoords.top,
//                 left: newRangeCoords.left
//             };
//
//             expect(newLeftRangeCoords).to.equal(expectedLeftRangeCoords);
//             expect(newRightRangeCoords).to.equal(expectedNewRightRangeCoords);
//
//             app.removeDom();
//         });
//     });
// });