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

    afterAll( async () => {
        await browser.close();
    });

    let sliderCoords: Coords;
    let rangeCoords: Coords;
    let handleCoords: Coords;

    let sliderMiddle: { left: number; top: number; };

    beforeEach(async () => {
        await sliderPage.createSlider();

        sliderCoords = await sliderPage.getSliderCoords();
        rangeCoords = await sliderPage.getRangeCoords();
        handleCoords = await sliderPage.getHandleCoords();

        sliderMiddle = await sliderPage.getSliderMiddle();
    });

    afterEach(async () => {
        await sliderPage.remove();
    });

    test("move jquery-slider-handle to specific coordinates inside the slider", async () => {
        await sliderPage.moveHandleToCoords(sliderMiddle.left,
            handleCoords.top);

        const newHandleCoords = await sliderPage.getHandleCoords();

        const newCoords = {
          top: newHandleCoords.top,
          left: newHandleCoords.left
        };
        const testCoords = await {
          top: handleCoords.top,
          left: sliderMiddle.left - handleCoords.width / 2
        };

        expect(newCoords.top).toBe(testCoords.top);
        expect(Math.floor(newCoords.left)).toBe(testCoords.left);
    }, timeout);

    test("handle stays within the slider when the cursor goes outside", async () => {
        await sliderPage.moveHandleToCoords(sliderCoords.left - 50,
            handleCoords.top);

        const newHandleCoordsLeft = await sliderPage.getHandleCoords();

        const newLeft_1 = newHandleCoordsLeft.left - sliderCoords.left;

        await sliderPage.moveHandleToCoords(sliderCoords.right + 50,
            newHandleCoordsLeft.top);

        const newHandleCoordsRight = await sliderPage.getHandleCoords();

        const newLeft_2 = newHandleCoordsRight.left - sliderCoords.left;

        const rightEdge = sliderCoords.width - newHandleCoordsRight.width;

        expect(newLeft_1).toBe(0 - handleCoords.width / 2);
        expect(newLeft_2).toBe(rightEdge + handleCoords.width / 2);
    }, timeout);

    test("range changes correctly when options.range = 'min'", async () => {
        await sliderPage.setOptions({ range: 'min' });

        const newModeRangeCoords = await sliderPage.getRangeCoords();

        expect(newModeRangeCoords.width).toBe(0);
        expect(newModeRangeCoords.left).toBe(sliderCoords.left);

        await sliderPage.moveHandleToCoords((await sliderPage.getSliderMiddle()).left,
            handleCoords.top);

        const newHandleCoords = await sliderPage.getHandleCoords();
        const newRangeCoords = await sliderPage.getRangeCoords();

        expect(newRangeCoords.left).toBe(sliderCoords.left);
        expect(newRangeCoords.right).toBe(newHandleCoords.left + newHandleCoords.width / 2);
        expect(newRangeCoords.width).toBe(newHandleCoords.left + newHandleCoords.width / 2
            - sliderCoords.left);
    }, timeout);

    test("range changes correctly when options.range = 'max'", async () => {
        await sliderPage.setOptions({range: 'max'});

        const newModeRangeCoords = await sliderPage.getRangeCoords();

        expect(newModeRangeCoords.width).toBe(sliderCoords.width);
        expect(newModeRangeCoords.right).toBe(sliderCoords.right);
        expect(newModeRangeCoords.left).toBe(sliderCoords.left);

        await sliderPage.moveHandleToCoords((await sliderPage.getSliderMiddle()).left,
            handleCoords.top);

        const newHandleCoords = await sliderPage.getHandleCoords();
        const newRangeCoords = await sliderPage.getRangeCoords();

        expect(newRangeCoords.right).toBe(sliderCoords.right);
        expect(newRangeCoords.left).toBe(newHandleCoords.left + newHandleCoords.width / 2);
        expect(newRangeCoords.width).toBe(sliderCoords.right
            - newHandleCoords.left - newHandleCoords.width / 2);

    }, timeout);
});