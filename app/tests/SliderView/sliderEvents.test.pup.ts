import puppeteer, {Browser, ElementHandle, Page} from "puppeteer";
import {JQueryElementWithSlider} from "../../src/jquery-slider";
import * as pup from './pup';

interface Coords {
    left: number,
    top: number,
    right: number,
    bottom: number,
    width: number,
    height: number

}


describe("slider events", () => {
    let browser: Browser, page: Page;
    const width = 1920;
    const height = 1080;
    const timeout = 30000;

    beforeAll(async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.setViewport({ width, height });

        await page.addScriptTag({path: 'node_modules/jquery/dist/jquery.min.js'});
        await page.addStyleTag({path: 'dist/css/main.css'});
        await page.addScriptTag({path: 'dist/js/index.js'});
    });

    afterAll(() => {
        browser.close();
    });
    let root: ElementHandle;
    let slider: ElementHandle, sliderCoords: Coords;
    let sliderMiddleLeft: number;
    let range: ElementHandle, rangeCoords: Coords;
    let handle: ElementHandle, handleCoords: Coords;

    beforeEach(async () => {
        await page.evaluate(() => {
            const root = $('<div class="slider"></div>') as JQueryElementWithSlider;

            $('body').append(root);

            root.slider();
        });

        root = await page.$('.slider');
        slider = await page.$('.jquery-slider');
        range = await page.$('.jquery-slider-range');
        handle = await page.$('.jquery-slider-handle');

        sliderCoords = await pup.getCoordinates(page, slider);
        rangeCoords = await pup.getCoordinates(page, range);
        handleCoords = await pup.getCoordinates(page, handle);

        sliderMiddleLeft = sliderCoords.left + sliderCoords.width / 2;
    });

    afterEach(async () => {
        await page.evaluate((root) => {
            root.remove();
        }, root);
    });

    test("move jquery-slider-handle to specific coordinates inside the slider", async () => {
        await pup.moveHandleToCoords(page, handle, sliderMiddleLeft, handleCoords.top);

        const newHandleCoords = await pup.getCoordinates(page, handle);

        const newCoords = {
          top: newHandleCoords.top,
          left: newHandleCoords.left
        };
        const testCoords = {
          top: handleCoords.top,
          left: sliderMiddleLeft
        };

        expect(newCoords.top).toBe(testCoords.top);
        expect(Math.floor(newCoords.left)).toBe(testCoords.left);
    }, timeout);

    test("handle stays within the slider when the cursor goes outside", async () => {
        await pup.moveHandleToCoords(page, handle, sliderCoords.left - 50, handleCoords.top);

        const newHandleCoordsLeft = await pup.getCoordinates(page, handle);

        const newLeft_1 = newHandleCoordsLeft.left - sliderCoords.left;

        await pup.moveHandleToCoords(page, handle, sliderCoords.right + 50, newHandleCoordsLeft.top);

        const newHandleCoordsRight = await pup.getCoordinates(page, handle);

        const newLeft_2 = newHandleCoordsRight.left - sliderCoords.left;

        const rightEdge = sliderCoords.width - newHandleCoordsRight.width;

        console.log(newHandleCoordsRight, newHandleCoordsLeft);

        expect(newLeft_1).toBe(0 - handleCoords.width / 2);
        expect(newLeft_2).toBe(rightEdge + handleCoords.width / 2);
    }, timeout);

    test("range changes correctly when options.range = 'min'", async () => {
        await page.evaluate((root) => {
            ($(root) as JQueryElementWithSlider).slider('options', { range: 'min' } );
        }, root);

        const newModeRangeCoords = await pup.getCoordinates(page, range);

        await expect(newModeRangeCoords.width).toBe(0);
        await expect(newModeRangeCoords.left).toBe(sliderCoords.left);

        await pup.moveHandleToCoords(page, handle, sliderMiddleLeft, handleCoords.top);

        const newHandleCoords = await pup.getCoordinates(page, handle);
        const newRangeCoords = await pup.getCoordinates(page, range);

        expect(newRangeCoords.left).toBe(sliderCoords.left);
        expect(newRangeCoords.right).toBe(newHandleCoords.left + newHandleCoords.width / 2);
        expect(newRangeCoords.width).toBe(newHandleCoords.left + newHandleCoords.width / 2
            - sliderCoords.left);
    }, timeout);

    test("range changes correctly when options.range = 'max'", async () => {
        await page.evaluate((root) => {
            ($(root) as JQueryElementWithSlider).slider('options', {range: 'max'});
        }, root);

        const newModeRangeCoords = await pup.getCoordinates(page, range);

        expect(newModeRangeCoords.width).toBe(0);
        expect(newModeRangeCoords.right).toBe(sliderCoords.right);

        await pup.moveHandleToCoords(page, handle, sliderMiddleLeft, handleCoords.top);

        const newHandleCoords = await pup.getCoordinates(page, handle);
        const newRangeCoords = await pup.getCoordinates(page, range);

        expect(newRangeCoords.right).toBe(sliderCoords.right);
        expect(newRangeCoords.left).toBe(newHandleCoords.left + newHandleCoords.width / 2);
        expect(newRangeCoords.width).toBe(sliderCoords.right - newHandleCoords.left
            - newHandleCoords.width / 2);

        // expect().
    }, timeout);
});