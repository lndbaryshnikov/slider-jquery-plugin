export const getCoords = (domElement) => {
  const box = domElement.getBoundingClientRect();

  return {
      top: box.top + pageYOffset,
      bottom: box.bottom + pageYOffset,
      left: box.left + pageXOffset,
      right: box.right + pageXOffset,
      width: box.width,
      height: box.height
    };
};