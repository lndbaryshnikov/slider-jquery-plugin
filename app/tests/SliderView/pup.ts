import {ElementHandle, Page} from "puppeteer";
import {Coords} from "../../src/functions/common/getCoords";

export const getCoordinates =  async (page: Page, dom: ElementHandle): Promise<Coords>  => {
    return await page.evaluate((dom) => {
        const {left, top, right, bottom, width, height} = dom.getBoundingClientRect();

        return {left, top, right, bottom, width, height};
    }, dom);
};

export const moveHandleToCoords = async (page: Page, handle: ElementHandle, X: number, Y: number) => {
    const handleCoords = await getCoordinates(page, handle);

    await page.mouse.move(handleCoords.left + 1, handleCoords.top + 1);
    await page.mouse.down();
    await page.mouse.move(X + 1, Y + 1);
    await page.mouse.up();
};