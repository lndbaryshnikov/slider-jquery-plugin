import puppeteer, {Browser, ElementHandle, Page} from "puppeteer";
import {JQueryElementWithSlider} from "../../src/jquery-slider";

interface Coords {
    left: number,
    top: number,
    right: number,
    bottom: number,
    width: number,
    height: number

}
const getCoordinates =  async (page: Page, dom: ElementHandle): Promise<Coords>  => {
    return await page.evaluate((dom) => {
        const {left, top, right, bottom, width, height} = dom.getBoundingClientRect();

        return {left, top, right, bottom, width, height};
    }, dom);
};

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

        slider = await page.$('.jquery-slider');
        range = await page.$('.jquery-slider-range');
        handle = await page.$('.jquery-slider-handle');

        sliderCoords = await getCoordinates(page, slider);
        rangeCoords = await getCoordinates(page, range);
        handleCoords = await getCoordinates(page, handle);

        sliderMiddleLeft = sliderCoords.left + sliderCoords.width / 2;
    });

    afterEach(async () => {
        const root: ElementHandle = await page.$('.slider');

        await page.evaluate((root) => {
            root.remove();
        }, root);
    });

    test("move jquery-slider-handle to specific coordinates inside the slider", async () => {
        await page.mouse.move(handleCoords.left + 1, handleCoords.top + 1);
        await page.mouse.down();
        await page.mouse.move(sliderMiddleLeft + 1, handleCoords.top + 1);
        await page.mouse.up();

        const newHandleCoords = await getCoordinates(page, handle);

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

        await page.mouse.move(handleCoords.left + 1, handleCoords.top + 1);
        await page.mouse.down();
        await page.mouse.move(sliderCoords.left - 50 - 1, handleCoords.top + 1);
        await page.mouse.up();

        const newHandleCoordsLeft = await getCoordinates(page, handle);

        const newLeft_1 = newHandleCoordsLeft.left - sliderCoords.left;

        await page.mouse.move(newHandleCoordsLeft.left + 1, newHandleCoordsLeft.top + 1);
        await page.mouse.down();
        await page.mouse.move(sliderCoords.right + 50 + 1, newHandleCoordsLeft.top + 1);
        await page.mouse.up();

        const newHandleCoordsRight = await getCoordinates(page, handle);

        const newLeft_2 = newHandleCoordsRight.left - sliderCoords.left;

        const rightEdge = sliderCoords.width - newHandleCoordsRight.width;

        console.log(newHandleCoordsRight, newHandleCoordsLeft);

        expect(newLeft_1).toBe(0 - handleCoords.width / 2);
        expect(newLeft_2).toBe(rightEdge + handleCoords.width / 2);
    }, timeout);

    test("range changes correctly when options.range = 'min'", async () => {
        const root: ElementHandle = await page.$('.slider');

        await page.evaluate((root) => {
            ($(root) as JQueryElementWithSlider).slider('options', { range: 'min' } );
        }, root);

        expect(rangeCoords.width).toBe(0);
        expect(rangeCoords.left).toBe(sliderCoords.left);

        await page.mouse.move(handleCoords.left + 1, handleCoords.top + 1);
        await page.mouse.down();
        await page.mouse.move(sliderMiddleLeft + 1, handleCoords.top + 1);
        await page.mouse.up();

        const newHandleCoords = await getCoordinates(page, handle);
        const newRangeCoords = await getCoordinates(page, range);

        expect(newRangeCoords.left).toBe(sliderCoords.left);
        expect(newRangeCoords.right).toBe(newHandleCoords.left + newHandleCoords.width / 2);
        expect(newRangeCoords.width).toBe(newHandleCoords.left + newHandleCoords.width / 2
            - sliderCoords.left);
    }, timeout);
});