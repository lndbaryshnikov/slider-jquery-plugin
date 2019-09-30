import puppeteer, {Browser, Page} from "puppeteer";
import SliderPupPage from "../SliderView/SliderPupPage";
import SliderModel from "../../src/MVP modules/Slider/SliderModel";

describe("slider API", () => {
    let browser: Browser, page: Page;
    let sliderPage: SliderPupPage;

    const timeout = SliderPupPage.timeout;

    beforeAll(async () => {
        browser = await puppeteer.launch();
        sliderPage = new SliderPupPage(browser);

        await sliderPage.createPage();

        page = sliderPage.page;
    });

    afterAll( async() => {
        await browser.close();
    });

    beforeEach(async () => {
        await sliderPage.createSlider();
    });

    afterEach(async () => {
        await sliderPage.remove();
    });

    test("options method works", async() => {
        const options = await sliderPage.getOptions();
        const classes = await sliderPage.getOptions("classes");
        const max = await sliderPage.getOptions("max");

        const defaults = SliderModel.getDefaultOptions("horizontal");

        expect(options).toEqual(defaults);
        expect(classes).toEqual(defaults.classes);
        expect(max).toEqual(defaults.max);

        await sliderPage.setOptions( {
            classes: {
                "jquery-slider": "my-slider"
            }
        } );

        const sliderClass = await sliderPage.getOptions("classes", "jquery-slider");

        expect(sliderClass).toEqual("my-slider");

        await sliderPage.setOptions("range", true);
        await sliderPage.setOptions("classes", "jquery-slider-handle", "my-handle");

        const range = await sliderPage.getOptions("range");
        const newClasses = await sliderPage.getOptions("classes");

        expect(range).toBe(true);
        expect(newClasses).toEqual({
            "jquery-slider jquery-slider-horizontal": "my-slider",
            "jquery-slider-range": "",
            "jquery-slider-handle": "my-handle"
        });
    }, timeout);
});