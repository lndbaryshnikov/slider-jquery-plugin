const areArraysEqual = (firstArray: any[], secondArray: any[]): boolean => {

    if (!firstArray || !secondArray) return false;

    if (firstArray.length !== secondArray.length) return false;

    for (let i = 0; i < firstArray.length; i++) {
        // Check if we have nested arrays
        if (firstArray[i] instanceof Array && secondArray[i] instanceof Array) {
            // recurse into the nested arrays
            if (!areArraysEqual(firstArray[i], secondArray[i])) return false;
        }
        else if (firstArray[i] !== secondArray[i]) {
            // Warning - two different object instances
            // will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

export default areArraysEqual;
