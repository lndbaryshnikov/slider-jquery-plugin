import puppeteer, { Browser, Page } from 'puppeteer';
import SliderPupPage, { Coords } from '../../test-utils/SliderPupPage/SliderPupPage';
import { Options } from '../../src/plugin/Model/modelOptions';
import SliderElement from '../../src/plugin/main';

describe('slider events', () => {
  let browser: Browser;
  let page: Page;
  let sliderPage: SliderPupPage;

  const { timeout } = SliderPupPage;

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
  let firstHandleCoords: Coords;

  let sliderMiddle: { left: number; top: number };

  describe('vertical slider events', () => {
    beforeEach(async () => {
      await sliderPage.createSlider({ orientation: 'vertical', animate: false });

      sliderCoords = await sliderPage.getSliderCoords();
      firstHandleCoords = await sliderPage.getFirstHandleCoords();
      sliderMiddle = await sliderPage.getSliderMiddle();
    });

    afterEach(async () => {
      await sliderPage.remove();
    });

    test('move handle to specific coordinates inside the slider', async () => {
      await sliderPage.moveHandleToCoords(firstHandleCoords.left, sliderMiddle.top);

      const newHandleCoords = await sliderPage.getFirstHandleCoords();

      const newCoords = {
        top: newHandleCoords.top,
        left: newHandleCoords.left,
      };
      const testCoords = {
        top: sliderMiddle.top - firstHandleCoords.height / 2,
        left: firstHandleCoords.left,
      };

      expect(newCoords.left).toBe(testCoords.left);
      expect(newCoords.top).toBe(testCoords.top);
    }, timeout);

    test('handle stays within the slider when the cursor goes outside', async () => {
      await sliderPage.moveHandleToCoords(firstHandleCoords.left, sliderCoords.top - 50);

      const newHandleCoordsTop = await sliderPage.getFirstHandleCoords();
      const firstNewTop = newHandleCoordsTop.top - sliderCoords.top;

      await sliderPage.moveHandleToCoords(newHandleCoordsTop.left, sliderCoords.bottom + 50);

      const newHandleCoordsBottom = await sliderPage.getFirstHandleCoords();
      const secondNewTop = newHandleCoordsBottom.top - sliderCoords.top;
      const bottomEdge = sliderCoords.height - newHandleCoordsBottom.height;

      expect(firstNewTop).toBe(0 - firstHandleCoords.height / 2);
      expect(secondNewTop).toBe(bottomEdge + firstHandleCoords.height / 2);
    }, timeout);

    test('range changes correctly when range = min', async () => {
      await sliderPage.setOptions({ range: 'min' });

      const { range } = sliderPage.elements;
      const newModeRangeCoords = await page.evaluate((rangeForCoords) => {
        const {
          left, top, right, bottom, width, height,
        } = rangeForCoords.getBoundingClientRect();

        return {
          left, top, right, bottom, width, height,
        };
      }, range);
      expect(newModeRangeCoords.height).toBe(0);
      expect(newModeRangeCoords.bottom).toBe(sliderCoords.bottom);

      await sliderPage.moveHandleToCoords(firstHandleCoords.left,
        (await sliderPage.getSliderMiddle()).top);

      const newHandleCoords = await sliderPage.getFirstHandleCoords();
      const newRangeCoords = await page.evaluate((rangeForCoords) => {
        const {
          left, top, right, bottom, width, height,
        } = rangeForCoords.getBoundingClientRect();

        return {
          left, top, right, bottom, width, height,
        };
      }, range);

      expect(newRangeCoords.bottom).toBe(sliderCoords.bottom);
      expect(newRangeCoords.top).toBe(newHandleCoords.top + newHandleCoords.height / 2);
      expect(newRangeCoords.height).toBe(sliderCoords.bottom - newHandleCoords.bottom
                + newHandleCoords.height / 2);
    }, timeout);

    test('range changes correctly when range = max', async () => {
      await sliderPage.setOptions({ range: 'max' });

      const newModeRangeCoords = await sliderPage.getRangeCoords();

      expect(newModeRangeCoords.height).toBe(sliderCoords.height);
      expect(newModeRangeCoords.top).toBe(sliderCoords.top);
      expect(newModeRangeCoords.bottom).toBe(sliderCoords.bottom);

      await sliderPage.moveHandleToCoords(
        firstHandleCoords.left,
        (await sliderPage.getSliderMiddle()).top,
      );

      const newHandleCoords = await sliderPage.getFirstHandleCoords();
      const newRangeCoords = await sliderPage.getRangeCoords();

      expect(newRangeCoords.top).toBe(sliderCoords.top);
      expect(newRangeCoords.bottom).toBe(
        newHandleCoords.top + newHandleCoords.height / 2,
      );
      expect(newRangeCoords.height).toBe(
        newHandleCoords.top + newHandleCoords.height / 2 - sliderCoords.top,
      );
    }, timeout);

    test('handle sets correctly depending on value option', async () => {
      await sliderPage.setOptions({ value: 10 });

      const handleTopWhenValueIsTen = sliderCoords.top + sliderCoords.height
        - sliderCoords.height * 0.1 - firstHandleCoords.height / 2;

      let newHandleCoords: Coords;

      newHandleCoords = await sliderPage.getFirstHandleCoords();

      expect(newHandleCoords.top).toBe(handleTopWhenValueIsTen);

      await sliderPage.setOptions({ value: 90 });

      const handleTopWhenValueIsNinety = sliderCoords.top + sliderCoords.height
        * 0.1 - firstHandleCoords.height / 2;

      newHandleCoords = await sliderPage.getFirstHandleCoords();

      expect(newHandleCoords.top).toBe(handleTopWhenValueIsNinety);
    }, timeout);

    test(
      'option value changes correctly with default options (min = 0, max = 100, step = 1)',
      async () => {
        let value: Options['value'];

        const getValue = async (): Promise<Options['value']> => (
          (await sliderPage.getOptions()).value
        );

        value = await getValue();
        expect(value).toBe(0);

        await sliderPage.moveHandleToCoords(firstHandleCoords.left, sliderMiddle.top);

        value = await getValue();
        expect(value).toBe(50);

        const positionForValueOfThirty = sliderCoords.top + sliderCoords.height
          - sliderCoords.height * 0.3;

        await sliderPage.moveHandleToCoords(
          firstHandleCoords.left,
          positionForValueOfThirty,
        );

        value = await getValue();
        expect(value).toBe(30);

        const positionForValueOfSeventy = sliderCoords.top + sliderCoords.height * 0.3;

        await sliderPage.moveHandleToCoords(firstHandleCoords.left, positionForValueOfSeventy);

        value = await getValue();
        expect(value).toBe(70);
      },
      timeout,
    );

    test('options value with not default min, max, value and step', async () => {
      await sliderPage.setOptions({
        min: 133,
        max: 233,
        step: 5,
        value: 138,
      });

      const moveHandleAndCompare = async (
        yRelative: number,
        valueExpected: number,
      ): Promise<void> => {
        const yToMove = sliderCoords.top + sliderCoords.height * (1 - yRelative);
        await sliderPage.moveHandleToCoords(firstHandleCoords.left, yToMove);

        const { value } = await sliderPage.getOptions();

        expect(value).toBe(valueExpected);
      };

      await moveHandleAndCompare(0.1, 143);
      await moveHandleAndCompare(0.34, 168);
      await moveHandleAndCompare(0.87, 218);
      await moveHandleAndCompare(0.98, 233);
    }, timeout);

    test('handle moves correctly when step is wide', async () => {
      await sliderPage.setOptions({ step: 20 });

      const testPosition = async (
        yMoveRelative: number,
        yExpectedRelative: number,
      ): Promise<void> => {
        const yToMove = sliderCoords.top + sliderCoords.height * (1 - yMoveRelative);
        const yExpected = sliderCoords.top + sliderCoords.height
          * (1 - yExpectedRelative) - firstHandleCoords.height / 2;

        await sliderPage.moveHandleToCoords(firstHandleCoords.left, yToMove);

        const newHandleCoords = await sliderPage.getFirstHandleCoords();

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

    test('tooltip moves correctly', async () => {
      await sliderPage.setOptions({ tooltip: true });

      const tooltipCoords = await sliderPage.getTooltipCoords();
      const tooltipText = await sliderPage.getTooltipValue();

      await sliderPage.moveHandleToCoords(firstHandleCoords.left, sliderMiddle.top);

      const newHandleCoords = await sliderPage.getFirstHandleCoords();
      const newTooltipCoords = await sliderPage.getTooltipCoords();
      const newTooltipText = await sliderPage.getTooltipValue();

      const handleRangeY = newHandleCoords.top - firstHandleCoords.top;
      const tooltipRangeY = newTooltipCoords.top - tooltipCoords.top;

      expect(tooltipRangeY).toBe(handleRangeY);
      expect(tooltipCoords.left).toBe(newTooltipCoords.left);
      expect(tooltipText).toBe('0');
      expect(newTooltipText).toBe('50');
    }, timeout);

    test('tooltip moves correctly when user clicks on slider', async () => {
      await page.mouse.click(
        sliderCoords.left + 1,
        (sliderCoords.top + sliderCoords.height * 0.3),
      );

      let newHandleCoords = await sliderPage.getFirstHandleCoords();
      let { value } = await sliderPage.getOptions();

      expect(value).toBe(70);
      expect(Math.round(newHandleCoords.top)).toBe(
        Math.round(sliderCoords.top + sliderCoords.height
          * 0.3 - firstHandleCoords.height / 2),
      );

      await page.mouse.click(sliderCoords.left, sliderMiddle.top);

      newHandleCoords = await sliderPage.getFirstHandleCoords();
      value = (await sliderPage.getOptions()).value;

      expect(value).toBe(50);
      expect(Math.round(newHandleCoords.top))
        .toBe(Math.round(sliderMiddle.top - firstHandleCoords.height / 2));
    }, timeout);

    test('handle does not move when user click on it, not on slider\'s scale', async () => {
      await page.mouse.click(firstHandleCoords.left + 1, firstHandleCoords.top + 1);

      const newHandleCoords = await sliderPage.getFirstHandleCoords();

      expect(newHandleCoords).toEqual(firstHandleCoords);
    }, timeout);

    test('labels coords are right', async () => {
      await sliderPage.setOptions({
        labels: true,
        pips: true,
        step: 10,
      });

      for (let X = 0, label = 1; X <= 1; X += 0.1, label += 1) {
        await sliderPage
          .moveHandleToCoords(
            firstHandleCoords.left,
            sliderCoords.top + sliderCoords.height * (1 - X),
          );

        const newHandleCoords = await sliderPage.getFirstHandleCoords();
        const handleMiddle = newHandleCoords.top + newHandleCoords.height / 2;

        const labelCoords = await sliderPage
          .getLabelData('coords', label) as { label: Coords; pip: Coords };

        const labelMiddle = labelCoords.label.top + labelCoords.label.height / 2;
        const pipMiddle = labelCoords.pip.top + labelCoords.pip.height / 2;

        expect(labelMiddle).toBe(handleMiddle);
        expect(pipMiddle).toBe(handleMiddle);
      }
    }, timeout);

    test('handle moves after label click', async () => {
      await sliderPage.setOptions({
        labels: true,
        pips: true,
        step: 10,
      });

      for (let label = 1; label <= 11; label += 1) {
        const labelCoords = await sliderPage
          .getLabelData('coords', label) as { label: Coords; pip: Coords };

        await page.mouse.click(labelCoords.label.left + 1, labelCoords.label.top + 1);

        const newHandleCoords = await sliderPage.getFirstHandleCoords();
        const handleMiddle = newHandleCoords.top + newHandleCoords.height / 2;
        const labelMiddle = labelCoords.label.top + labelCoords.label.height / 2;

        expect(handleMiddle).toBe(labelMiddle);
      }
    }, timeout);

    test('handles move correctly when range is true', async () => {
      await sliderPage.setOptions({
        range: true,
        value: [0, 1000],
        max: 1000,
        step: 1,
        labels: false,
        pips: false,
        tooltip: false,
      });

      expect(sliderPage.elements.secondHandle).not.toBe(null);

      let newRangeCoords: Coords;
      let newFirstHandleCoords: Coords;
      let newSecondHandleCoords: Coords;
      let valueOption: Options['value'];

      const refreshValues = async (): Promise<void> => {
        newRangeCoords = await sliderPage.getRangeCoords();
        newFirstHandleCoords = await sliderPage.getFirstHandleCoords();
        newSecondHandleCoords = await sliderPage.getSecondHandleCoords();
        valueOption = (await sliderPage.getOptions()).value;
      };

      await refreshValues();

      expect(valueOption).toEqual([0, 1000]);

      expect(firstHandleCoords.bottom).toBe(sliderCoords.bottom + firstHandleCoords.height / 2);
      expect(newSecondHandleCoords.bottom).toBe(sliderCoords.top
        + newSecondHandleCoords.height / 2);
      expect(newRangeCoords.height).toBe(sliderCoords.height);

      const handleLeft = firstHandleCoords.left;

      await sliderPage.moveHandleToCoords(handleLeft, sliderCoords.top + sliderCoords.height * 0.7);
      await sliderPage.moveHandleToCoords(
        handleLeft,
        sliderCoords.top + sliderCoords.height * 0.3,
        true,
      );

      await refreshValues();

      expect(newFirstHandleCoords.top)
        .toBe(sliderCoords.top + sliderCoords.height * 0.7 - firstHandleCoords.height / 2);
      expect(newSecondHandleCoords.top)
        .toBe(sliderCoords.top + sliderCoords.height * 0.3 - newSecondHandleCoords.height / 2);

      expect(newRangeCoords.height).toBe(sliderCoords.height * 0.4);
      expect(newRangeCoords.bottom)
        .toBe(newFirstHandleCoords.top + newFirstHandleCoords.height / 2);
      expect(newRangeCoords.top)
        .toBe(newSecondHandleCoords.top + newSecondHandleCoords.height / 2);

      expect(valueOption).toEqual([300, 700]);

      await sliderPage
        .moveHandleToCoords(handleLeft, sliderCoords.top + sliderCoords.height * 0.1);

      await refreshValues();

      expect(newSecondHandleCoords.top)
        .toBe(
          sliderCoords.top + sliderCoords.height * 0.3
            - newSecondHandleCoords.height / 2,
        );

      expect(Math.floor(newFirstHandleCoords.top))
        .toBe(Math.floor(newSecondHandleCoords.bottom));

      expect(newRangeCoords.bottom)
        .toBe(newFirstHandleCoords.top + newFirstHandleCoords.height / 2);
      expect(Math.round(newRangeCoords.top))
        .toBe(newSecondHandleCoords.top + newSecondHandleCoords.height / 2);

      expect(Math.ceil(newRangeCoords.height)).toBe(
        Math.ceil(newFirstHandleCoords.height),
      );
    }, timeout);
  });

  describe('horizontal slider events', () => {
    beforeEach(async () => {
      await sliderPage.createSlider({ animate: false });

      sliderCoords = await sliderPage.getSliderCoords();
      firstHandleCoords = await sliderPage.getFirstHandleCoords();
      sliderMiddle = await sliderPage.getSliderMiddle();
    });

    afterEach(async () => {
      await sliderPage.remove();
    });

    test('move jquery-slider-handle to specific coordinates inside the slider', async () => {
      await sliderPage.moveHandleToCoords(sliderMiddle.left,
        firstHandleCoords.top);

      const newHandleCoords = await sliderPage.getFirstHandleCoords();
      const newCoords = {
        top: newHandleCoords.top,
        left: newHandleCoords.left,
      };
      const testCoords = {
        top: firstHandleCoords.top,
        left: sliderMiddle.left - firstHandleCoords.width / 2,
      };

      expect(newCoords.top).toBe(testCoords.top);
      expect(Math.floor(newCoords.left)).toBe(Math.floor(testCoords.left));
    }, timeout);

    test('firstHandle stays within the slider when the cursor goes outside', async () => {
      await sliderPage.moveHandleToCoords(sliderCoords.left - 50,
        firstHandleCoords.top);

      const newHandleCoordsLeft = await sliderPage.getFirstHandleCoords();
      const firstNewLeft = newHandleCoordsLeft.left - sliderCoords.left;

      await sliderPage.moveHandleToCoords(sliderCoords.right + 50,
        newHandleCoordsLeft.top);

      const newHandleCoordsRight = await sliderPage.getFirstHandleCoords();
      const secondNewLeft = newHandleCoordsRight.left - sliderCoords.left;
      const rightEdge = sliderCoords.width - newHandleCoordsRight.width;

      expect(firstNewLeft).toBe(0 - firstHandleCoords.width / 2);
      expect(secondNewLeft).toBe(rightEdge + firstHandleCoords.width / 2);
    }, timeout);

    test('range changes correctly when range = min', async () => {
      await sliderPage.setOptions({ range: 'min' });

      const newModeRangeCoords = await sliderPage.getRangeCoords();

      expect(newModeRangeCoords.width).toBe(0);
      expect(newModeRangeCoords.left).toBe(sliderCoords.left);

      await sliderPage.moveHandleToCoords((await sliderPage.getSliderMiddle()).left,
        firstHandleCoords.top);

      const newHandleCoords = await sliderPage.getFirstHandleCoords();
      const newRangeCoords = await sliderPage.getRangeCoords();

      expect(newRangeCoords.left).toBe(sliderCoords.left);
      expect(newRangeCoords.right).toBe(newHandleCoords.left + newHandleCoords.width / 2);
      expect(newRangeCoords.width).toBe(newHandleCoords.left + newHandleCoords.width / 2
                - sliderCoords.left);
    }, timeout);

    test('range changes correctly when range = max', async () => {
      await sliderPage.setOptions({ range: 'max' });

      const newModeRangeCoords = await sliderPage.getRangeCoords();

      expect(newModeRangeCoords.width).toBe(sliderCoords.width);
      expect(newModeRangeCoords.right).toBe(sliderCoords.right);
      expect(newModeRangeCoords.left).toBe(sliderCoords.left);

      await sliderPage.moveHandleToCoords((await sliderPage.getSliderMiddle()).left,
        firstHandleCoords.top);

      const newHandleCoords = await sliderPage.getFirstHandleCoords();
      const newRangeCoords = await sliderPage.getRangeCoords();

      expect(newRangeCoords.right).toBe(sliderCoords.right);
      expect(newRangeCoords.left).toBe(newHandleCoords.left + newHandleCoords.width / 2);
      expect(newRangeCoords.width).toBe(
        sliderCoords.right - newHandleCoords.left - newHandleCoords.width / 2,
      );
    }, timeout);

    test('firstHandle sets correctly depending on value option', async () => {
      await sliderPage.setOptions({ value: 10 });

      const handleLeftWhenValueIsTen = sliderCoords.left
        + sliderCoords.width * 0.1 - firstHandleCoords.width / 2;

      let newHandleCoords: Coords;

      newHandleCoords = await sliderPage.getFirstHandleCoords();

      expect(newHandleCoords.left).toBe(handleLeftWhenValueIsTen);

      await sliderPage.setOptions({ value: 90 });

      const handleLeftWhenValueIsNinety = sliderCoords.left + sliderCoords.width
        * 0.9 - firstHandleCoords.width / 2;

      newHandleCoords = await sliderPage.getFirstHandleCoords();

      expect(newHandleCoords.left).toBe(handleLeftWhenValueIsNinety);
    }, timeout);

    test(
      'option value changes correctly with default options (min = 0, max = 100, step = 1)',
      async () => {
        let value: Options['value'];

        const getValue = async (): Promise<Options['value']> => (
          (await sliderPage.getOptions()).value
        );
        value = await getValue();
        expect(value).toBe(0);

        await sliderPage.moveHandleToCoords(sliderMiddle.left, firstHandleCoords.top);

        value = await getValue();
        expect(value).toBe(50);

        const positionForValueOfThirty = sliderCoords.left + sliderCoords.width * 0.3;

        await sliderPage.moveHandleToCoords(positionForValueOfThirty, firstHandleCoords.top);

        value = await getValue();
        expect(value).toBe(30);

        const positionForValueOfSeventy = sliderCoords.left + sliderCoords.width * 0.7;

        await sliderPage.moveHandleToCoords(positionForValueOfSeventy, firstHandleCoords.top);

        value = await getValue();
        expect(value).toBe(70);
      }, timeout,
    );

    test('options value with not default min, max, value and step', async () => {
      await sliderPage.setOptions({
        min: 133,
        max: 233,
        step: 5,
        value: 138,
      });

      const testValue = async (xRelative: number, valueExpected: number): Promise<void> => {
        const xToMove = sliderCoords.left + sliderCoords.width * xRelative;
        await sliderPage.moveHandleToCoords(xToMove, firstHandleCoords.top);

        const { value } = await sliderPage.getOptions();

        expect(value).toBe(valueExpected);
      };

      await testValue(0.1, 143);
      await testValue(0.34, 168);
      await testValue(0.87, 218);
      await testValue(0.98, 233);
    }, timeout);

    test('firstHandle moves correctly when step is wide', async () => {
      await sliderPage.setOptions({ step: 20 });

      const testPosition = async (
        xMoveRelative: number,
        xExpectedRelative: number,
      ): Promise<void> => {
        const xToMove = sliderCoords.left + sliderCoords.width * xMoveRelative;
        const xExpected = sliderCoords.left + sliderCoords.width
          * xExpectedRelative - firstHandleCoords.width / 2;

        await sliderPage.moveHandleToCoords(xToMove, firstHandleCoords.top);

        const newHandleCoords = await sliderPage.getFirstHandleCoords();

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

    test('tooltip moves correctly', async () => {
      await sliderPage.setOptions({ tooltip: true });

      const tooltipCoords = await sliderPage.getTooltipCoords();
      const tooltipText = await sliderPage.getTooltipValue();

      await sliderPage.moveHandleToCoords(sliderMiddle.left, firstHandleCoords.top);

      const newHandleCoords = await sliderPage.getFirstHandleCoords();
      const newTooltipCoords = await sliderPage.getTooltipCoords();
      const newTooltipText = await sliderPage.getTooltipValue();
      const handleRangeX = newHandleCoords.left - firstHandleCoords.left;
      const tooltipRangeX = newTooltipCoords.left - tooltipCoords.left;

      expect(tooltipRangeX).toBe(handleRangeX);
      expect(tooltipCoords.top).toBe(newTooltipCoords.top);
      expect(tooltipText).toBe('0');
      expect(newTooltipText).toBe('50');
    }, timeout);

    test('firstHandle moves correctly when user clicks on slider', async () => {
      await page.mouse.click((sliderCoords.left + sliderCoords.width * 0.3), sliderCoords.top + 1);

      let newHandleCoords = await sliderPage.getFirstHandleCoords();
      let { value } = await sliderPage.getOptions();

      expect(value).toBe(30);
      expect(Math.round(newHandleCoords.left)).toBe(
        Math.round(sliderCoords.left + sliderCoords.width
          * 0.3 - firstHandleCoords.width / 2),
      );

      await page.mouse.click(sliderMiddle.left, sliderCoords.top);

      newHandleCoords = await sliderPage.getFirstHandleCoords();
      value = (await sliderPage.getOptions()).value;

      expect(value).toBe(50);
      expect(Math.round(newHandleCoords.left))
        .toBe(Math.round(sliderMiddle.left - firstHandleCoords.width / 2));
    }, timeout);

    test('firstHandle does not move when user click on it, not on slider\'s scale', async () => {
      await page.mouse.click(firstHandleCoords.right - 1, firstHandleCoords.top + 1);

      const newHandleCoords = await sliderPage.getFirstHandleCoords();

      expect(newHandleCoords).toEqual(firstHandleCoords);
    }, timeout);

    test('labels coords are right', async () => {
      await sliderPage.setOptions({
        labels: true,
        pips: true,
        step: 10,
      });

      for (let X = 0, label = 1; X <= 1; X += 0.1, label += 1) {
        await sliderPage.moveHandleToCoords(
          sliderCoords.left + sliderCoords.width * X,
          firstHandleCoords.top,
        );

        const newHandleCoords = await sliderPage.getFirstHandleCoords();
        const handleMiddle = newHandleCoords.left + newHandleCoords.width / 2;

        const labelCoords = await sliderPage
          .getLabelData('coords', label) as { label: Coords; pip: Coords };

        const labelMiddle = labelCoords.label.left + labelCoords.label.width / 2;
        const pipMiddle = labelCoords.pip.left + labelCoords.pip.width / 2;

        expect(labelMiddle).toBe(handleMiddle);
        expect(pipMiddle).toBe(handleMiddle);
      }
    }, timeout);

    test('firstHandle moves after label click', async () => {
      await sliderPage.setOptions({
        labels: true,
        pips: true,
        step: 10,
      });

      for (let label = 1; label <= 11; label += 1) {
        const labelCoords = await sliderPage
          .getLabelData('coords', label) as { label: Coords; pip: Coords };

        await page.mouse.click(labelCoords.label.left + 1, labelCoords.label.top + 1);

        const newHandleCoords = await sliderPage.getFirstHandleCoords();
        const handleMiddle = newHandleCoords.left + newHandleCoords.width / 2;
        const labelMiddle = labelCoords.label.left + labelCoords.label.width / 2;

        expect(handleMiddle).toBe(labelMiddle);
      }
    }, timeout);

    test('handles move correctly when range is true', async () => {
      await sliderPage.setOptions({
        range: true,
        value: [0, 1000],
        max: 1000,
      });

      expect(sliderPage.elements.secondHandle).not.toBe(null);

      let newRangeCoords: Coords;
      let newFirstHandleCoords: Coords;
      let newSecondHandleCoords: Coords;
      let valueOption: Options['value'];

      const refreshValues = async (): Promise<void> => {
        newRangeCoords = await sliderPage.getRangeCoords();
        newFirstHandleCoords = await sliderPage.getFirstHandleCoords();
        newSecondHandleCoords = await sliderPage.getSecondHandleCoords();
        valueOption = (await sliderPage.getOptions()).value;
      };

      await refreshValues();

      expect(valueOption).toEqual([0, 1000]);
      expect(firstHandleCoords.left).toBe(sliderCoords.left - firstHandleCoords.width / 2);
      expect(newSecondHandleCoords.left).toBe(sliderCoords.right - newSecondHandleCoords.width / 2);
      expect(newRangeCoords.width).toBe(sliderCoords.width);

      const handleTop = firstHandleCoords.top;

      await sliderPage.moveHandleToCoords(sliderCoords.left + sliderCoords.width * 0.3, handleTop);
      await sliderPage.moveHandleToCoords(
        sliderCoords.left + sliderCoords.width * 0.7,
        handleTop, true,
      );

      await refreshValues();

      expect(newFirstHandleCoords.left)
        .toBe(sliderCoords.left + sliderCoords.width * 0.3 - firstHandleCoords.width / 2);
      expect(newSecondHandleCoords.left)
        .toBe(sliderCoords.left + sliderCoords.width * 0.7 - newSecondHandleCoords.width / 2);

      expect(newRangeCoords.width).toBe(sliderCoords.width * 0.4);
      expect(newRangeCoords.left).toBe(newFirstHandleCoords.left + newFirstHandleCoords.width / 2);
      expect(newRangeCoords.right)
        .toBe(newSecondHandleCoords.left + newSecondHandleCoords.width / 2);

      expect(valueOption).toEqual([300, 700]);

      await sliderPage.moveHandleToCoords(sliderCoords.left + sliderCoords.width * 0.9, handleTop);

      await refreshValues();

      expect(newSecondHandleCoords.left)
        .toBe(sliderCoords.left + sliderCoords.width * 0.7 - newSecondHandleCoords.width / 2);

      expect(Math.floor(newFirstHandleCoords.right))
        .toBe(Math.floor(newSecondHandleCoords.left));

      expect(newRangeCoords.left).toBe(newFirstHandleCoords.left + newFirstHandleCoords.width / 2);
      expect(Math.round(newRangeCoords.right))
        .toBe(newSecondHandleCoords.left + newSecondHandleCoords.width / 2);

      expect(Math.ceil(newRangeCoords.width)).toBe(Math.ceil(newFirstHandleCoords.width));
    }, timeout);
  });

  describe('common events', () => {
    beforeEach(async () => {
      await sliderPage.createSlider({ animate: false });

      sliderCoords = await sliderPage.getSliderCoords();
      firstHandleCoords = await sliderPage.getFirstHandleCoords();

      sliderMiddle = await sliderPage.getSliderMiddle();
    });

    afterEach(async () => {
      await sliderPage.remove();
    });

    test('option change works with input for value', async () => {
      await page.evaluate(() => {
        const input = document.createElement('input');
        document.body.appendChild(input);

        const changeFunction = (value: number | number[]): void => {
          if (!Array.isArray(value)) {
            input.value = String(value);
          } else {
            input.value = `${value[0]} - ${value[1]}`;
          }
        };
        ($('.slider') as SliderElement)
          .slider('options', { change: changeFunction });
      });

      const compareValue = async (): Promise<void> => {
        const inputValue = await page.evaluate(() => (document.querySelector('input')).value);
        const valueOption = (await sliderPage.getOptions()).value;

        expect(String(inputValue)).toBe(
          Array.isArray(valueOption) ? `${valueOption[0]} - ${valueOption[1]}`
            : String(valueOption),
        );
      };

      const testValues = async (mode: 'set' | 'move', valueOrPercent: number): Promise<void> => {
        if (mode === 'set') {
          await sliderPage.setOptions({ value: valueOrPercent });
        }

        if (mode === 'move') {
          await sliderPage
            .moveHandleToCoords(sliderCoords.left + (sliderCoords.width * valueOrPercent) / 100,
              firstHandleCoords.top);
        }
        await compareValue();
      };
      await testValues('set', 30);
      await testValues('move', 50);
      await testValues('set', 70);
      await testValues('move', 70);

      await page.evaluate(() => {
        document.querySelector('input').remove();
      });
    }, timeout);
  });
});
