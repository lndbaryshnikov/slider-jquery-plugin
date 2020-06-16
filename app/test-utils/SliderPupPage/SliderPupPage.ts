import {
  Browser, ElementHandle, Page, JSHandle,
} from 'puppeteer';
import { UserOptions, Options } from '../../src/plugin/Model/modelOptions';
import SliderElement from '../../src/plugin/main';
import { CompleteUserOptions } from '../../src/plugin/Presenter/Presenter';

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
      const root = $("<div class='slider'></div>") as SliderElement;

      $('body').append(root);

      root.slider(optionsToEval);
    }, options as JSHandle<UserOptions>);

    await this._defineElements(options);
  }

  async setOptions(options: CompleteUserOptions): Promise<void> {
    await this.pupPage.evaluate(
      (root: HTMLElement, optionsToEval: CompleteUserOptions) => {
        ($(root) as SliderElement).slider('options', optionsToEval);
      },
      this.root,
      options as JSHandle<CompleteUserOptions>,
    );

    const optionsSet = (await this.getOptions()) as Options;
    await this._defineElements(optionsSet);
  }

  async getOptions(): Promise<CompleteUserOptions> {
    return await this.pupPage.evaluate(
      (root: HTMLElement) => ($(root) as SliderElement).slider('options'),
      this.root,
    ) as unknown as CompleteUserOptions;
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
        const labels = document.querySelectorAll('.jquery-slider-scale__label');
        const labelNeeded = labels[LabelNumber - 1] as HTMLElement;
        const labelFirstChild = labelNeeded.children[0] as HTMLElement;

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
          const labelCoords = getCoords(labelNeeded);
          const pipCoords = labelFirstChild
            ? getCoords(labelFirstChild)
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
    if (!this.secondHandle) throw new Error('second handle does not exist');

    return this.getCoords(this.secondHandle);
  }

  async getTooltipCoords(): Promise<Coords> {
    if (!this.tooltip) throw new Error('tooltip does not set');
    return this.getCoords(this.tooltip);
  }

  async getTooltipValue(): Promise<number | string> {
    if (!this.tooltip) throw new Error('tooltip does not set');

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
    const {
      left, width, top, height,
    } = await this.getCoords(this.slider);

    return {
      left: left + width / 2,
      top: top + height / 2,
    };
  }

  async moveHandleToCoords(X: number, Y: number, isSecond?: true): Promise<void> {
    if (isSecond && !this.secondHandle) {
      throw new Error('second handle doesn\'t exist');
    }

    const handleCoords = isSecond
      ? await this.getCoords(this.secondHandle)
      : await this.getCoords(this.firstHandle);

    const {
      left, width, top, height,
    } = handleCoords;

    await this.pupPage.mouse.move(left + width / 2, top + height / 2);
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
    this.range = await this.pupPage.$('.jquery-slider__range');
    this.firstHandle = await this.pupPage.$('.jquery-slider__handle');

    const isRangeTrue = options && options.range === true;

    if (isRangeTrue) {
      [, this.secondHandle] = await this.pupPage.$$('.jquery-slider__handle');
    } else this.secondHandle = null;

    const isTooltipRequired = options && options.tooltip;

    if (isTooltipRequired) {
      this.tooltip = await this.pupPage.$('.jquery-slider-tooltip');
    } else this.tooltip = null;
  }
}
