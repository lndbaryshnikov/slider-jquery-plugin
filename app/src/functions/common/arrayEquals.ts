const arrayEquals = (array_1: any[], array_2: any[]): boolean => {

    if (!array_1 || !array_2) return false;

    if (array_1.length !== array_2.length) return false;

    for (let i = 0; i < array_1.length; i++) {
        // Check if we have nested arrays
        if (array_1[i] instanceof Array && array_2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!arrayEquals(array_1[i], array_2[i])) return false;
        }
        else if (array_1[i] !== array_2[i]) {
            // Warning - two different object instances
            // will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

export default arrayEquals;