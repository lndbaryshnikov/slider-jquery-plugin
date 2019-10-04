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

    afterAll(() => {
        browser.close();
    });

    let sliderCoords: Coords;
    let rangeCoords: Coords;
    let handleCoords: Coords;

    let sliderMiddle: { left: number; top: number; };

    describe("vertical slider events", () => {
        beforeEach(async () => {
            await sliderPage.createSlider({ orientation: "vertical", animate: false });

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

        test("handle sets correctly depending on 'value' option", async () => {
            await sliderPage.setOptions("value", 10);

            const handleTopWhenValueIsTen = sliderCoords.top + sliderCoords.height -
                sliderCoords.height * 0.1 - handleCoords.height / 2;

            let newHandleCoords: Coords;

            newHandleCoords = await sliderPage.getHandleCoords();

            expect(newHandleCoords.top).toBe(handleTopWhenValueIsTen);

            await sliderPage.setOptions("value", 90);

            const handleTopWhenValueIsNinety = sliderCoords.top + sliderCoords.height * 0.1 - handleCoords.height / 2;

            newHandleCoords = await sliderPage.getHandleCoords();

            expect(newHandleCoords.top).toBe(handleTopWhenValueIsNinety);
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

            const positionForValueOfSeventy = sliderCoords.top + sliderCoords.height * 0.3;

            await sliderPage.moveHandleToCoords(handleCoords.left, positionForValueOfSeventy);

            value = await getValue();
            expect(value).toBe(70);

        }, timeout);

        test("options 'value' with not default 'min', 'max', 'value' and 'step'", async () => {
            await sliderPage.setOptions({
                min: 133,
                max: 233,
                step: 5,
                value: 138
            });

            const testValue = async (yRelative: number, valueExpected: number) => {
                const yToMove = sliderCoords.top + sliderCoords.height * (1 - yRelative);
                await sliderPage.moveHandleToCoords(handleCoords.left, yToMove);

                const value = await sliderPage.getOptions("value") as Options["value"];

                expect(value).toBe(valueExpected);
            };

            await testValue(0.1, 143);
            await testValue(0.34, 168);
            await testValue(0.87, 218);
            await testValue(0.98, 233);

        }, timeout);

        test("handle moves correctly when step is wide", async() => {
            await sliderPage.setOptions("step", 20);

            const testPosition = async (yMoveRelative: number, yExpectedRelative: number) => {
                const yToMove = sliderCoords.top + sliderCoords.height * (1 - yMoveRelative);
                const yExpected = sliderCoords.top + sliderCoords.height * (1 - yExpectedRelative) - handleCoords.height / 2;

                await sliderPage.moveHandleToCoords(handleCoords.left, yToMove);

                const newHandleCoords = await sliderPage.getHandleCoords();

                expect(newHandleCoords.top).toBe(yExpected);
            };

            await testPosition(0.07, 0);
            await testPosition(0.1, 0.2);
            await testPosition(0.13, 0.2);
            await testPosition(0.5, 0.6);
            await testPosition(0.73, 0.8);
            await testPosition(0.84, 0.8);
            await testPosition(0.9, 1);
        }, timeout);

        test("tooltip moves correctly", async () => {
            await sliderPage.setOptions("tooltip", true);

            const tooltipCoords = await sliderPage.getTooltipCoords();
            const tooltipText = await sliderPage.getTooltipValue();

            await sliderPage.moveHandleToCoords(handleCoords.left, sliderMiddle.top);

            const newHandleCoords = await sliderPage.getHandleCoords();
            const newTooltipCoords = await sliderPage.getTooltipCoords();
            const newTooltipText = await sliderPage.getTooltipValue();

            const handleRangeY = newHandleCoords.top - handleCoords.top;
            const tooltipRangeY = newTooltipCoords.top - tooltipCoords.top;

            expect(tooltipRangeY).toBe(handleRangeY);
            expect(tooltipCoords.left).toBe(newTooltipCoords.left);
            expect(tooltipText).toBe("0");
            expect(newTooltipText).toBe("50");
        }, timeout);

        test("tooltip moves correctly when user clicks on slider", async () => {
            await page.mouse.click(sliderCoords.left + 1, (sliderCoords.top + sliderCoords.height * 0.3));

            let newHandleCoords = await sliderPage.getHandleCoords();
            let value = await sliderPage.getOptions("value");

            expect(value).toBe(70);
            expect(Math.round(newHandleCoords.top))
                .toBe(Math.round(sliderCoords.top + sliderCoords.height * 0.3 - handleCoords.height / 2));

            await page.mouse.click(sliderCoords.left, sliderMiddle.top);

            newHandleCoords = await sliderPage.getHandleCoords();
            value = await sliderPage.getOptions("value");

            expect(value).toBe(50);
            expect(Math.round(newHandleCoords.top))
                .toBe(Math.round(sliderMiddle.top - handleCoords.height / 2));
        }, timeout);

        test("handle doesn't move when user click on it, not on slider's scale", async () => {
            await page.mouse.click(handleCoords.left + 1, handleCoords.top + 1);

            const newHandleCoords = await sliderPage.getHandleCoords();

            expect(newHandleCoords).toEqual(handleCoords);
        }, timeout);
    });

    describe("horizontal slider events", () => {
        beforeEach(async () => {
            await sliderPage.createSlider({ animate: false });

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

        test("handle sets correctly depending on 'value' option", async () => {
            await sliderPage.setOptions("value", 10);

            const handleLeftWhenValueIsTen = sliderCoords.left + sliderCoords.width * 0.1 - handleCoords.width / 2;

            let newHandleCoords: Coords;

            newHandleCoords = await sliderPage.getHandleCoords();

            expect(newHandleCoords.left).toBe(handleLeftWhenValueIsTen);

            await sliderPage.setOptions("value", 90);

            const handleLeftWhenValueIsNinety = sliderCoords.left + sliderCoords.width * 0.9 - handleCoords.width / 2;

            newHandleCoords = await sliderPage.getHandleCoords();

            expect(newHandleCoords.left).toBe(handleLeftWhenValueIsNinety);
        }, timeout);

        test("option 'value' changes correctly with default options ('min' = 0, 'max' = 100, 'step' = 1)", async () => {
            let value: Options["value"];

            const getValue = async() => {
                return await sliderPage.getOptions("value") as Options["value"];
            };

            value = await getValue();
            expect(value).toBe(0);

            await sliderPage.moveHandleToCoords(sliderMiddle.left, handleCoords.top);

            value = await getValue();
            expect(value).toBe(50);

            const positionForValueOfThirty = sliderCoords.left + sliderCoords.width * 0.3;

            await sliderPage.moveHandleToCoords(positionForValueOfThirty, handleCoords.top);

            value = await getValue();
            expect(value).toBe(30);

            const positionForValueOfSeventy = sliderCoords.left + sliderCoords.width * 0.7;

            await sliderPage.moveHandleToCoords(positionForValueOfSeventy, handleCoords.top);

            value = await getValue();
            expect(value).toBe(70);
        }, timeout);

        test("options 'value' with not default 'min', 'max', 'value' and 'step'", async () => {
            await sliderPage.setOptions({
                min: 133,
                max: 233,
                step: 5,
                value: 138
            });

            const testValue = async (xRelative: number, valueExpected: number) => {
                const xToMove = sliderCoords.left + sliderCoords.width * xRelative;
                await sliderPage.moveHandleToCoords(xToMove, handleCoords.top);

                const value = await sliderPage.getOptions("value") as Options["value"];

                expect(value).toBe(valueExpected);
            };

            await testValue(0.1, 143);
            await testValue(0.34, 168);
            await testValue(0.87, 218);
            await testValue(0.98, 233);
        }, timeout);

        test("handle moves correctly when step is wide", async() => {
            await sliderPage.setOptions("step", 20);

            const testPosition = async (xMoveRelative: number, xExpectedRelative: number) => {
                const xToMove = sliderCoords.left + sliderCoords.width * xMoveRelative;
                const xExpected = sliderCoords.left + sliderCoords.width * xExpectedRelative - handleCoords.width / 2;

                await sliderPage.moveHandleToCoords(xToMove, handleCoords.top);

                const newHandleCoords = await sliderPage.getHandleCoords();

                expect(newHandleCoords.left).toBe(xExpected);
            };

            await testPosition(0.07, 0);
            await testPosition(0.1, 0.2);
            await testPosition(0.13, 0.2);
            await testPosition(0.5, 0.6);
            await testPosition(0.73, 0.8);
            await testPosition(0.84, 0.8);
            await testPosition(0.9, 1);
        }, timeout);

        test("tooltip moves correctly", async () => {
            await sliderPage.setOptions("tooltip", true);

            const tooltipCoords = await sliderPage.getTooltipCoords();
            const tooltipText = await sliderPage.getTooltipValue();

            await sliderPage.moveHandleToCoords(sliderMiddle.left, handleCoords.top);

            const newHandleCoords = await sliderPage.getHandleCoords();
            const newTooltipCoords = await sliderPage.getTooltipCoords();
            const newTooltipText = await sliderPage.getTooltipValue();

            const handleRangeX = newHandleCoords.left - handleCoords.left;
            const tooltipRangeX = newTooltipCoords.left - tooltipCoords.left;

            expect(tooltipRangeX).toBe(handleRangeX);
            expect(tooltipCoords.top).toBe(newTooltipCoords.top);
            expect(tooltipText).toBe("0");
            expect(newTooltipText).toBe("50");
        }, timeout);

        test("handle moves correctly when user clicks on slider", async () => {
            await page.mouse.click((sliderCoords.left + sliderCoords.width * 0.3), sliderCoords.top + 1);

            let newHandleCoords = await sliderPage.getHandleCoords();
            let value = await sliderPage.getOptions("value");

            expect(value).toBe(30);
            expect(Math.round(newHandleCoords.left))
                .toBe(Math.round(sliderCoords.left + sliderCoords.width * 0.3 - handleCoords.width / 2));

            await page.mouse.click(sliderMiddle.left, sliderCoords.top);

            newHandleCoords = await sliderPage.getHandleCoords();
            value = await sliderPage.getOptions("value");

            expect(value).toBe(50);
            expect(Math.round(newHandleCoords.left))
                .toBe(Math.round(sliderMiddle.left - handleCoords.width / 2));
        }, timeout);

        test("handle doesn't move when user click on it, not on slider's scale", async () => {
            await page.mouse.click(handleCoords.right - 1, handleCoords.top + 1);

            const newHandleCoords = await sliderPage.getHandleCoords();

            expect(newHandleCoords).toEqual(handleCoords);
        }, timeout);
    });
});