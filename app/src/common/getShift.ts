import getCoords from './getCoords';

interface Shift {
  x: number;
  y: number;
}

const getShift = (event: MouseEvent, elem: HTMLElement): Shift => {
  const elemCoords = getCoords(elem);

  return {
    x: event.pageX - elemCoords.left,
    y: event.pageY - elemCoords.top,
  };
};

export { Shift, getShift };
