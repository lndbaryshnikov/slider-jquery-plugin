const areArraysEqual = (firstArray: any[], secondArray: any[]): boolean => {
  if (!firstArray || !secondArray) return false;

  if (firstArray.length !== secondArray.length) return false;

  const haveDifferentValues = firstArray.some((value, index) => {
    // Check if we have nested arrays
    if (firstArray[index] instanceof Array && secondArray[index] instanceof Array) {
      // Recurse into the nested arrays
      if (!areArraysEqual(firstArray[index], secondArray[index])) return true;
    } else if (firstArray[index] !== secondArray[index]) {
      // Warning - two different object instances
      // will never be equal: {x:20} != {x:20}
      return true;
    }

    return false;
  });

  return !haveDifferentValues;
};

export default areArraysEqual;
