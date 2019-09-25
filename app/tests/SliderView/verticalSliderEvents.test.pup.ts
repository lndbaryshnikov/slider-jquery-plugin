import puppeteer, {Browser, Page} from "puppeteer";
import SliderPupPage, {Coords} from './SliderPupPage'

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

    beforeEach(async () => {
        await sliderPage.createSlider({ orientation: "vertical" });

        sliderCoords = await sliderPage.getSliderCoords();
        rangeCoords = await sliderPage.getRangeCoords();
        handleCoords = await sliderPage.getHandleCoords();
    });

    afterEach(async () => {
        await sliderPage.remove();
    });

    test("move jquery-slider-handle to specific coordinates inside the slider", async () => {
        await sliderPage.moveHandleToCoords(handleCoords.left, (await sliderPage.getSliderMiddle()).top);

        const newHandleCoords = await sliderPage.getHandleCoords();

        const newCoords = {
            top: newHandleCoords.top,
            left: newHandleCoords.left
        };
        const testCoords = await {
            top: (await sliderPage.getSliderMiddle()).top,
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
});