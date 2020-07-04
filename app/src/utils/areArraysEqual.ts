type AllowedArrayMembers = string | number | [];

const areArraysEqual = (
  firstArray: AllowedArrayMembers[],
  secondArray: AllowedArrayMembers[],
): boolean => {
  if (!firstArray || !secondArray) return false;

  if (firstArray.length !== secondArray.length) return false;

  const haveDifferentValues = firstArray.some((value, index) => {
    // Check if we have nested arrays
    if (firstArray[index] instanceof Array && secondArray[index] instanceof Array) {
      // Recurse into the nested arrays
      const nestedFirst = firstArray[index] as [];
      const nestedSecond = secondArray[index] as [];
      if (!areArraysEqual(nestedFirst, nestedSecond)) return true;
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
