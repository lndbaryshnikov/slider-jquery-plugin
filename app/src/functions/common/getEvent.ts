const getEvent = (type: string, x?: number | string, y?: number | string): JQuery.Event => {
  const e = $.Event(type);

  if (x !== 'empty') {
    if (typeof x === 'number') {
      e.pageX = x;
    }
  }

  if (y !== 'empty') {
    if (typeof y === 'number') {
      e.pageY = y;
    }
  }

  return e;
};
