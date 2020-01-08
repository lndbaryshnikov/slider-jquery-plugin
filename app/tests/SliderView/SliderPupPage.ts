// eslint-disable-next-line import/no-extraneous-dependencies
import { Browser, ElementHandle, Page } from 'puppeteer';

import { JQueryElementWithSlider } from '../../src/jquery-slider';
import { Options, RestOptionsToSet, UserOptions } from '../../src/MVP modules/Slider/SliderModel';

export interface Coords {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export default class SliderPupPage {
  private _page: Page;

  private _root: ElementHandle = null;

  private _slider: ElementHandle = null;

  private _range: ElementHandle = null;

  private _firstHandle: ElementHandle = null;

  private _secondHandle: ElementHandle = null;

  private _tooltip: ElementHandle = null;

  // eslint-disable-next-line no-useless-constructor
  constructor(private _browser: Browser) { }

  async createPage() {
    this._page = await this._browser.newPage();

    const width = 1920;
    const height = 1080;

    await this.setViewport(width, height);

    await this._page.addScriptTag({ path: 'node_modules/jquery/dist/jquery.min.js' });
    await this._page.addStyleTag({ path: 'dist/css/jquery-slider.css' });
    await this._page.addScriptTag({ path: 'dist/js/jquery-slider.js' });
  }

  async createSlider(options?: UserOptions) {
    await this._page.evaluate((optionsToEval: UserOptions) => {
      const root = $("<div class='slider'></div>") as JQueryElementWithSlider;

      $('body').append(root);

      root.slider(optionsToEval);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
    }, options);

    await this._defineElements(options);
  }

  async setOptions(...options: (UserOptions | RestOptionsToSet)[]) {
    await this._page.evaluate((
      root: HTMLElement,
      ...optionsToEval: (UserOptions | keyof Options | keyof Options)[]
    ) => {
      ($(root) as JQueryElementWithSlider).slider('options', ...optionsToEval);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
    }, this._root, ...options);

    const optionsSet = await this.getOptions() as Options;

    await this._defineElements(optionsSet);
  }

  async getOptions(...options: (UserOptions | RestOptionsToSet)[]) {
    return await this._page.evaluate((root: HTMLElement, ...optionsToEval: (UserOptions | keyof Options | keyof Options)[]) => ($(root) as JQueryElementWithSlider).slider('options', ...optionsToEval),
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
      this._root, ...options) as unknown as Options | (Options[keyof Options] |
    Options['classes'][keyof Options['classes']]);
  }

  get elements() {
    return {
      root: this._root,
      slider: this._slider,
      range: this._range,
      firstHandle: this._firstHandle,
      secondHandle: this._secondHandle,
      tooltip: this._tooltip,
    };
  }

  async getLabelData(data: 'classes' | 'coords', numberOfLabel: number) {
    return await this._page.evaluate((dataToEval: string, LabelNumber: number) => {
      const labels = document.querySelectorAll('.jquery-slider-label');

      const labelNeeded = labels[LabelNumber - 1];

      if (dataToEval === 'classes') {
        const labelClass = labelNeeded.className;
        const pipClass = labelNeeded.children[0] ? labelNeeded.children[0].className : null;

        return {
          label: labelClass,
          pip: pipClass,
        } as { label: string; pip: string };
      }

      const getCoords = (elem: HTMLElement): Coords => {
        const {
          left, top, right, bottom, width, height,
        } = elem.getBoundingClientRect();

        return {
          left, top, right, bottom, width, height,
        };
      };

      if (dataToEval === 'coords') {
        const labelCoords = getCoords(labelNeeded as HTMLElement);
        const pipCoords = labelNeeded.children[0]
          ? getCoords(labelNeeded.children[0] as HTMLElement) : null;

        return {
          label: labelCoords,
          pip: pipCoords,
        } as { label: Coords; pip: Coords };
      }
    }, data, numberOfLabel);
  }

  async getSliderCoords(): Promise<Coords> {
    return await this.getCoords(this._slider);
  }

  async getRangeCoords(): Promise<Coords> {
    return await this.getCoords(this._range);
  }

  async getFirstHandleCoords(): Promise<Coords> {
    return await this.getCoords(this._firstHandle);
  }

  async getSecondHandleCoords(): Promise<Coords> {
    if (!this._secondHandle) throw new Error("Second handle doesn't exist");

    return await this.getCoords(this._secondHandle);
  }

  async getTooltipCoords(): Promise<Coords> {
    if (!this._tooltip) throw new Error("tooltip doesn't set");
    return await this.getCoords(this._tooltip);
  }

  async getTooltipValue(): Promise<number | string> {
    if (!this._tooltip) throw new Error("tooltip doesn't set");

    return await this._page
      .evaluate(
        (tooltip: ElementHandle) => (tooltip as unknown as HTMLElement).innerHTML, this._tooltip,
      );
  }

  static get timeout(): number {
    return 50000;
  }

  get page(): Page {
    return this._page;
  }

  async injectJquery(): Promise<void> {
    await this._page.addScriptTag({ path: 'node_modules/jquery/dist/jquery.min.js' });
  }

  async injectStyles(path: string): Promise<void> {
    await this._page.addStyleTag({ path });
  }

  async injectScript(path: string): Promise<void> {
    await this._page.addScriptTag({ path });
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this._page.setViewport({ width, height });
  }

  async getCoords(dom: ElementHandle): Promise<Coords> {
    return await this._page.evaluate((domToEval) => {
      const {
        left, top, right, bottom, width, height,
      } = domToEval.getBoundingClientRect();

      return {
        left, top, right, bottom, width, height,
      };
    }, dom);
  }

  async getSliderMiddle(): Promise<{ left: number; top: number }> {
    return {
      left: (await this.getCoords(this._slider)).left
        + (await this.getCoords(this._slider)).width / 2,
      top: (await this.getCoords(this._slider)).top
        + (await this.getCoords(this._slider)).height / 2,
    };
  }

  async moveHandleToCoords(X: number, Y: number, isSecond?: true): Promise<void> {
    if (isSecond && !this._secondHandle) throw new Error("second handle doesn't exist");

    let handleCoords: Coords;
    if (isSecond) handleCoords = await this.getCoords(this._secondHandle);
    else handleCoords = await this.getCoords(this._firstHandle);

    await this._page.mouse.move(handleCoords.left + handleCoords.width / 2,
      handleCoords.top + handleCoords.height / 2);
    await this._page.mouse.down();
    await this._page.mouse.move(X, Y);
    await this._page.mouse.up();
  }

  async remove(): Promise<void> {
    await this._page.evaluate((root) => {
      root.remove();
    }, this._root);

    this._root = null;
    this._slider = null;
    this._range = null;
    this._firstHandle = null;
    this._secondHandle = null;
    this._tooltip = null;
  }

  private async _defineElements(options: Options | UserOptions): Promise<void> {
    this._root = await this._page.$('.slider');
    this._slider = await this._page.$('.jquery-slider');
    this._range = await this._page.$('.jquery-slider-range');
    this._firstHandle = await this._page.$('.jquery-slider-handle');

    if (options && options.range === true) {
      [this._secondHandle] = (await this._page.$$('.jquery-slider-handle'));
    } else this._secondHandle = null;

    if (options && options.tooltip) {
      this._tooltip = await this._page.$('.jquery-slider-tooltip');
    } else this._tooltip = null;
  }
}
