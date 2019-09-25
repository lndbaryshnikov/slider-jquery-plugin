import {Browser, ElementHandle, Page} from "puppeteer";
import {JQueryElementWithSlider} from "../../src/jquery-slider";
import {Options, RestOptionsToSet, UserOptions} from "../../src/MVP modules/Slider/SliderModel";

export interface Coords {
    left: number,
    top: number,
    right: number,
    bottom: number,
    width: number,
    height: number
}

export default class SliderPupPage {
    private _page: Page;
    private _root: ElementHandle;
    private _slider: ElementHandle;
    private _range: ElementHandle;
    private _handle: ElementHandle;

    constructor(private _browser: Browser) { }

    async createPage() {
        this._page = await this._browser.newPage();

        const width = 1920;
        const height = 1080;

        await this.setViewport(width, height);

        await this._page.addScriptTag({path: 'node_modules/jquery/dist/jquery.min.js'});
        await this._page.addStyleTag({path: 'dist/css/main.css'});
        await this._page.addScriptTag({path: 'dist/js/index.js'});
    }

    async createSlider(options?: UserOptions) {
        await this._page.evaluate((options: UserOptions) => {
            const root = $('<div class="slider"></div>') as JQueryElementWithSlider;

            $('body').append(root);

            root.slider(options);
            // @ts-ignore
        }, options);

        this._root = await this._page.$('.slider');
        this._slider = await this._page.$('.jquery-slider');
        this._range = await this._page.$('.jquery-slider-range');
        this._handle = await this._page.$('.jquery-slider-handle');
    }

    async setOptions(...options: (UserOptions | RestOptionsToSet)[]){
        await this._page.evaluate((root: HTMLElement, ...options: (UserOptions | keyof Options | keyof Options)[]) => {

            ($(root) as JQueryElementWithSlider).slider('options', ...options);
            // @ts-ignore
        }, this._root, ...options);
    }

    async getOptions(...options: (UserOptions | RestOptionsToSet)[]) {
        return await this._page.evaluate((root: HTMLElement, ...options: (UserOptions | keyof Options | keyof Options)[]) => {

            return ($(root) as JQueryElementWithSlider).slider('options', ...options);
            // @ts-ignore
        }, this._root, ...options);
    }

    get elements() {
        return {
            root: this._root,
            slider: this._slider,
            range: this._range,
            handle: this._handle
        }
    }

    async getSliderCoords() {
        return await this._getCoords(this._slider);
    }

    async getRangeCoords() {
        return await this._getCoords(this._range);
    }

    async getHandleCoords() {
        return await this._getCoords(this._handle);
    }


    static get timeout() {
        return 50000;
    }

    get page() {
        return this._page;
    }

    async injectJquery() {
        await this._page.addScriptTag({path: 'node_modules/jquery/dist/jquery.min.js'});
    }

    async injectStyles(path: string) {
        await this._page.addStyleTag({path: path});
    }

    async injectScript(path: string) {
        await this._page.addScriptTag({path: path});
    }

    async setViewport(width: number, height: number) {
        await this._page.setViewport({ width, height });
    }

    async _getCoords(dom: ElementHandle): Promise<Coords> {
        return await this._page.evaluate((dom) => {
            const {left, top, right, bottom, width, height} = dom.getBoundingClientRect();

            return {left, top, right, bottom, width, height};
        }, dom);
    }

    async getSliderMiddle() {
        return {
            left: (await this._getCoords(this._slider)).left + (await this._getCoords(this._slider)).width / 2,
            top: (await this._getCoords(this._slider)).top + (await this._getCoords(this._slider)).height / 2
        };
    }

    async moveHandleToCoords (X: number, Y: number) {
        const handleCoords = await this._getCoords(this._handle);

        await this._page.mouse.move(handleCoords.left + 1, handleCoords.top + 1);
        await this._page.mouse.down();
        await this._page.mouse.move(X + 1, Y + 1);
        await this._page.mouse.up();
    }

    async remove() {
        await this._page.evaluate((root) => {
            root.remove();
        }, this._root);

        this._root = null;
        this._slider = null;
        this._range = null;
        this._handle = null;
    }
}
