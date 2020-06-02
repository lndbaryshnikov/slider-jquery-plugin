const hasAnArrayElements = (array: any[], sourceArray: any[]): boolean => {
  let has: boolean;

  for (let i = 0; i < array.length; i += 1) {
    has = false;

    for (let j = 0; j < sourceArray.length; j += 1) {
      if (array[i] === sourceArray[j]) {
        has = true;

        break;
      }
    }

    if (has === false) {
      break;
    }
  }
  return has;
};

export default hasAnArrayElements;
