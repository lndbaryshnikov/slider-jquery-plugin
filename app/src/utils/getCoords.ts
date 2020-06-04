interface Coords {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

const getCoords = (domElem: HTMLElement): Coords => {
  const box = domElem.getBoundingClientRect();

  const mainCoords = {
    top: box.top + window.pageYOffset,
    bottom: box.bottom + window.pageYOffset,
    left: box.left + window.pageXOffset,
    right: box.right + window.pageXOffset,
    width: box.width,
    height: box.height,
  };

  const centerCoords = {
    centerX: mainCoords.left + mainCoords.width / 2,
    centerY: mainCoords.top + mainCoords.height / 2,
  };

  return {
    ...mainCoords,
    ...centerCoords,
  };
};

export default getCoords;
export { Coords };
