import {
  Browser, ElementHandle, Page, JSHandle,
} from 'puppeteer';

import { JQueryElementWithSlider } from '../jquery-slider';
import { Options, RestOptionsToSet, UserOptions } from '../Slider/SliderModel';

export interface Coords {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export default class SliderPupPage {
  private pupPage: Page;

  private root: ElementHandle = null;

  private slider: ElementHandle = null;

  private range: ElementHandle = null;

  private firstHandle: ElementHandle = null;

  private secondHandle: ElementHandle = null;

  private tooltip: ElementHandle = null;

  private browser: Browser

  constructor(browser: Browser) {
    this.browser = browser;
  }

  async createPage(): Promise<void> {
    this.pupPage = await this.browser.newPage();

    const width = 1920;
    const height = 1080;

    await this.setViewport({ width, height });

    await this.pupPage.addScriptTag({
      path: 'node_modules/jquery/dist/jquery.min.js',
    });
    await this.pupPage.addStyleTag({ path: 'dist/css/jquery-slider.css' });
    await this.pupPage.addScriptTag({ path: 'dist/js/jquery-slider.js' });
  }

  async createSlider(options?: UserOptions): Promise<void> {
    await this.pupPage.evaluate((optionsToEval: UserOptions) => {
      const root = $("<div class='slider'></div>") as JQueryElementWithSlider;

      $('body').append(root);

      root.slider(optionsToEval);
    }, options as JSHandle<UserOptions>);

    await this._defineElements(options);
  }

  async setOptions(...options: (UserOptions | RestOptionsToSet)[]): Promise<void> {
    await this.pupPage.evaluate(
      (
        root: HTMLElement,
        ...optionsToEval: (UserOptions | keyof Options | keyof Options)[]
      ) => {
        ($(root) as JQueryElementWithSlider).slider(
          'options',
          ...optionsToEval,
        );
      },
      this.root,
      ...options as JSHandle<UserOptions | RestOptionsToSet>[],
    );

    const optionsSet = (await this.getOptions()) as Options;

    await this._defineElements(optionsSet);
  }

  async getOptions(...options: (UserOptions | RestOptionsToSet)[]): Promise<
    | Options
    | Options['classes'][keyof Options['classes']]
    | Options[keyof Options]
  > {
    return ((await this.pupPage.evaluate(
      (
        root: HTMLElement,
        ...optionsToEval: (UserOptions | keyof Options | keyof Options)[]
      ) => ($(root) as JQueryElementWithSlider).slider(
        'options',
        ...optionsToEval,
      ),
      this.root,
      ...options as JSHandle<UserOptions | RestOptionsToSet>[],
    )) as unknown) as
      | Options
      | (Options[keyof Options] | Options['classes'][keyof Options['classes']]);
  }

  get elements(): (
    Record<'root' | 'slider' | 'range' | 'firstHandle' | 'secondHandle' | 'tooltip', ElementHandle>
  ) {
    return {
      root: this.root,
      slider: this.slider,
      range: this.range,
      firstHandle: this.firstHandle,
      secondHandle: this.secondHandle,
      tooltip: this.tooltip,
    };
  }

  async getLabelData(
    data: 'classes' | 'coords',
    labelNumber: number,
  ): Promise<{ label: string; pip: string } | { label: Coords; pip: Coords }> {
    return this.pupPage.evaluate(
      (dataToEval: string, LabelNumber: number) => {
        const labels = document.querySelectorAll('.jquery-slider-label');

        const labelNeeded = labels[LabelNumber - 1];
        const labelFirstChild = labelNeeded.children[0];

        if (dataToEval === 'classes') {
          const labelClass = labelNeeded.className;
          const pipClass = labelFirstChild
            ? labelFirstChild.className
            : null;

          return {
            label: labelClass,
            pip: pipClass,
          } as { label: string; pip: string };
        }

        const getCoords = (elem: HTMLElement): Coords => {
          const {
            left,
            top,
            right,
            bottom,
            width,
            height,
          } = elem.getBoundingClientRect();

          return {
            left,
            top,
            right,
            bottom,
            width,
            height,
          };
        };

        if (dataToEval === 'coords') {
          const labelCoords = getCoords(labelNeeded as HTMLElement);
          const pipCoords = labelFirstChild
            ? getCoords(labelFirstChild as HTMLElement)
            : null;

          return {
            label: labelCoords,
            pip: pipCoords,
          } as { label: Coords; pip: Coords };
        }

        return undefined;
      },
      data,
      labelNumber,
    );
  }

  async getSliderCoords(): Promise<Coords> {
    return this.getCoords(this.slider);
  }

  async getRangeCoords(): Promise<Coords> {
    return this.getCoords(this.range);
  }

  async getFirstHandleCoords(): Promise<Coords> {
    return this.getCoords(this.firstHandle);
  }

  async getSecondHandleCoords(): Promise<Coords> {
    if (!this.secondHandle) throw new Error("Second handle doesn't exist");

    return this.getCoords(this.secondHandle);
  }

  async getTooltipCoords(): Promise<Coords> {
    if (!this.tooltip) throw new Error("tooltip doesn't set");
    return this.getCoords(this.tooltip);
  }

  async getTooltipValue(): Promise<number | string> {
    if (!this.tooltip) throw new Error("tooltip doesn't set");

    return this.pupPage.evaluate(
      (tooltip: ElementHandle) => ((tooltip as unknown) as HTMLElement).innerHTML,
      this.tooltip,
    );
  }

  static get timeout(): number {
    return 50000;
  }

  get page(): Page {
    return this.pupPage;
  }

  async injectJquery(): Promise<void> {
    await this.pupPage.addScriptTag({
      path: 'node_modules/jquery/dist/jquery.min.js',
    });
  }

  async injectStyles(path: string): Promise<void> {
    await this.pupPage.addStyleTag({ path });
  }

  async injectScript(path: string): Promise<void> {
    await this.pupPage.addScriptTag({ path });
  }

  async setViewport({ width, height }: {
    width: number;
    height: number;
  }): Promise<void> {
    await this.pupPage.setViewport({ width, height });
  }

  async getCoords(dom: ElementHandle): Promise<Coords> {
    return this.pupPage.evaluate((domToEval) => {
      const {
        left,
        top,
        right,
        bottom,
        width,
        height,
      } = domToEval.getBoundingClientRect();

      return {
        left,
        top,
        right,
        bottom,
        width,
        height,
      };
    }, dom);
  }

  async getSliderMiddle(): Promise<{ left: number; top: number }> {
    return {
      left:
        (await this.getCoords(this.slider)).left
        + (await this.getCoords(this.slider)).width / 2,
      top:
        (await this.getCoords(this.slider)).top
        + (await this.getCoords(this.slider)).height / 2,
    };
  }

  async moveHandleToCoords(
    X: number,
    Y: number,
    isSecond?: true,
  ): Promise<void> {
    if (isSecond && !this.secondHandle) throw new Error("second handle doesn't exist");

    let handleCoords: Coords;

    if (isSecond) {
      handleCoords = await this.getCoords(this.secondHandle);
    } else handleCoords = await this.getCoords(this.firstHandle);

    await this.pupPage.mouse.move(
      handleCoords.left + handleCoords.width / 2,
      handleCoords.top + handleCoords.height / 2,
    );
    await this.pupPage.mouse.down();
    await this.pupPage.mouse.move(X, Y);
    await this.pupPage.mouse.up();
  }

  async remove(): Promise<void> {
    await this.pupPage.evaluate((root) => {
      root.remove();
    }, this.root);

    this.root = null;
    this.slider = null;
    this.range = null;
    this.firstHandle = null;
    this.secondHandle = null;
    this.tooltip = null;
  }

  private async _defineElements(options: Options | UserOptions): Promise<void> {
    this.root = await this.pupPage.$('.slider');
    this.slider = await this.pupPage.$('.jquery-slider');
    this.range = await this.pupPage.$('.jquery-slider-range');
    this.firstHandle = await this.pupPage.$('.jquery-slider-handle');

    const isRangeTrue = options && options.range === true;

    if (isRangeTrue) {
      // eslint-disable-next-line prefer-destructuring
      [, this.secondHandle] = await this.pupPage.$$('.jquery-slider-handle');
    } else this.secondHandle = null;

    const isTooltipRequired = options && options.tooltip;

    if (isTooltipRequired) {
      this.tooltip = await this.pupPage.$('.jquery-slider-tooltip');
    } else this.tooltip = null;
  }
}
