interface Coords {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

const getCoords = (domElement: HTMLElement): Coords => {
  const box = domElement.getBoundingClientRect();

  return {
    top: box.top + window.pageYOffset,
    bottom: box.bottom + window.pageYOffset,
    left: box.left + window.pageXOffset,
    right: box.right + window.pageXOffset,
    width: box.width,
    height: box.height,
  };
};

export default getCoords;
export { Coords };
