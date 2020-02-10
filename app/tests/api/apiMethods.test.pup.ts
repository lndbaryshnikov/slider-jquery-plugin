// eslint-disable-next-line import/no-extraneous-dependencies
import puppeteer, { Browser } from 'puppeteer';

import SliderPupPage from '../../src/components/SliderPupPage/SliderPupPage';
import SliderModel from '../../src/components/Slider/SliderModel';

describe('slider API', () => {
  let browser: Browser;
  let sliderPage: SliderPupPage;

  const { timeout } = SliderPupPage;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    sliderPage = new SliderPupPage(browser);

    await sliderPage.createPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    await sliderPage.createSlider();
  });

  afterEach(async () => {
    await sliderPage.remove();
  });

  test('options method works', async () => {
    const options = await sliderPage.getOptions();
    const classes = await sliderPage.getOptions('classes');
    const max = await sliderPage.getOptions('max');

    const defaults = SliderModel.getDefaultOptions('horizontal');

    expect(options).toEqual(defaults);
    expect(classes).toEqual(defaults.classes);
    expect(max).toEqual(defaults.max);

    await sliderPage.setOptions({
      classes: {
        'jquery-slider': 'my-slider',
      },
    });

    const sliderClass = await sliderPage.getOptions('classes', 'jquery-slider');

    expect(sliderClass).toEqual('my-slider');

    await sliderPage.setOptions('range', 'min');
    await sliderPage.setOptions('classes', 'jquery-slider-handle', 'my-firstHandle');

    const range = await sliderPage.getOptions('range');
    const newClasses = await sliderPage.getOptions('classes');

    expect(range).toBe('min');
    expect(newClasses).toEqual({
      'jquery-slider jquery-slider-horizontal': 'my-slider',
      'jquery-slider-range': '',
      'jquery-slider-handle': 'my-firstHandle',
    });
  }, timeout);
});
