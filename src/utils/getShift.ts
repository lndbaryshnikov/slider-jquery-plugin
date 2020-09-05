import getCoords from './getCoords';

interface Shift {
  x: number;
  y: number;
}

const getShift = ({ event, element }: {
  event: MouseEvent;
  element: HTMLElement;
  }): Shift => {
  const elemCoords = getCoords(element);

  return {
    x: event.pageX - elemCoords.left,
    y: event.pageY - elemCoords.top,
  };
};

export default getShift;
export { Shift };
