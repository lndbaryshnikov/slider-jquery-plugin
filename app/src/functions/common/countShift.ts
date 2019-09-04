import getCoords from "./getCoords";

export interface Shift {
  x: number;
  y: number;
}

export const countShift = (event: MouseEvent, elem: HTMLElement): Shift => {
    const elemCoords = getCoords(elem);

    return {
        x: event.pageX - elemCoords.left,
        y: event.pageY - elemCoords.top
    };
};