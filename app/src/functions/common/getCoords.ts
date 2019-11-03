export interface Coords {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
}

const getCoords = (domElem: HTMLElement): Coords => {
  const box = domElem.getBoundingClientRect();

  return {
      top: box.top + pageYOffset,
      bottom: box.bottom + pageYOffset,
      left: box.left + pageXOffset,
      right: box.right + pageXOffset,
      width: box.width,
      height: box.height
    };
};

export default getCoords;
