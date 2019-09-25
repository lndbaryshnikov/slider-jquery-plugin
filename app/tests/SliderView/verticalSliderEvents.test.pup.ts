import puppeteer, {Browser, Page} from "puppeteer";
import SliderPupPage, {Coords} from './SliderPupPage'
import {Options} from "../../src/MVP modules/Slider/SliderModel";

describe("slider events", () => {
    let browser: Browser, page: Page;
    let sliderPage: SliderPupPage;

    const timeout = SliderPupPage.timeout;

    beforeAll(async () => {
        browser = await puppeteer.launch();
        sliderPage = new SliderPupPage(browser);

        await sliderPage.createPage();

        page = sliderPage.page;
    });

    afterAll(async () => {
        await browser.close();
    });

    let sliderCoords: Coords;
    let rangeCoords: Coords;
    let handleCoords: Coords;

    let sliderMiddle: { left: number; top: number; };

    beforeEach(async () => {
        await sliderPage.createSlider({ orientation: "vertical" });

        sliderCoords = await sliderPage.getSliderCoords();
        rangeCoords = await sliderPage.getRangeCoords();
        handleCoords = await sliderPage.getHandleCoords();

        sliderMiddle = await sliderPage.getSliderMiddle();
    });

    afterEach(async () => {
        await sliderPage.remove();
    });

    test("move jquery-slider-handle to specific coordinates inside the slider", async () => {
        await sliderPage.moveHandleToCoords(handleCoords.left, sliderMiddle.top);

        const newHandleCoords = await sliderPage.getHandleCoords();

        const newCoords = {
            top: newHandleCoords.top,
            left: newHandleCoords.left
        };
        const testCoords = await {
            top: sliderMiddle.top - handleCoords.height / 2,
            left: handleCoords.left
        };

        expect(newCoords.left).toBe(testCoords.left);
        expect(Math.floor(newCoords.top)).toBe(testCoords.top);
    }, timeout);

    test("handle stays within the slider when the cursor goes outside", async () => {
        await sliderPage.moveHandleToCoords(handleCoords.left, sliderCoords.top - 50);

        const newHandleCoordsTop = await sliderPage.getHandleCoords();

        const newTop_1 = newHandleCoordsTop.top - sliderCoords.top;

        await sliderPage.moveHandleToCoords(newHandleCoordsTop.left, sliderCoords.bottom + 50);

        const newHandleCoordsBottom = await sliderPage.getHandleCoords();

        const newTop_2 = newHandleCoordsBottom.top - sliderCoords.top;

        const bottomEdge = sliderCoords.height - newHandleCoordsBottom.height;

        expect(newTop_1).toBe(0 - handleCoords.height / 2);
        expect(newTop_2).toBe(bottomEdge + handleCoords.height / 2);
    }, timeout);

    test("range changes correctly when options.range = 'min'", async () => {
        await sliderPage.setOptions({ range: 'min' });

        const newModeRangeCoords = await sliderPage.getRangeCoords();

        expect(newModeRangeCoords.height).toBe(0);
        expect(newModeRangeCoords.bottom).toBe(sliderCoords.bottom);

        await sliderPage.moveHandleToCoords(handleCoords.left,
            (await sliderPage.getSliderMiddle()).top);

        const newHandleCoords = await sliderPage.getHandleCoords();
        const newRangeCoords = await sliderPage.getRangeCoords();

        expect(newRangeCoords.bottom).toBe(sliderCoords.bottom);
        expect(newRangeCoords.top).toBe(newHandleCoords.top + newHandleCoords.height / 2);
        expect(newRangeCoords.height).toBe(sliderCoords.bottom -  newHandleCoords.bottom
            + newHandleCoords.height / 2);
    }, timeout);

    test("range changes correctly when options.range = 'max'", async () => {
        await sliderPage.setOptions({range: 'max'});

        const newModeRangeCoords = await sliderPage.getRangeCoords();

        expect(newModeRangeCoords.height).toBe(sliderCoords.height);
        expect(newModeRangeCoords.top).toBe(sliderCoords.top);
        expect(newModeRangeCoords.bottom).toBe(sliderCoords.bottom);

        await sliderPage.moveHandleToCoords(handleCoords.left, (await sliderPage.getSliderMiddle()).top);

        const newHandleCoords = await sliderPage.getHandleCoords();
        const newRangeCoords = await sliderPage.getRangeCoords();

        expect(newRangeCoords.top).toBe(sliderCoords.top);
        expect(newRangeCoords.bottom).toBe(newHandleCoords.top + newHandleCoords.height / 2);
        expect(newRangeCoords.height).toBe(newHandleCoords.top + newHandleCoords.height / 2
            - sliderCoords.top);

    }, timeout);

    test("option 'value' changes correctly with default options ('min' = 0, 'max' = 100, 'step' = 1)", async () => {
        let value: Options["value"];

        const getValue = async() => {
            return await sliderPage.getOptions("value") as Options["value"];
        };

        value = await getValue();
        expect(value).toBe(0);

        await sliderPage.moveHandleToCoords(handleCoords.left, sliderMiddle.top);

        value = await getValue();
        expect(value).toBe(50);

        const positionForValueOfThirty = sliderCoords.top + sliderCoords.height - sliderCoords.height * 0.3;

        await sliderPage.moveHandleToCoords(handleCoords.left, positionForValueOfThirty);

        value = await getValue();
        expect(value).toBe(30);

    }, timeout);
});