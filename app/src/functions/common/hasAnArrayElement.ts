export const hasAnArrayElements = (array: any[], sourceArray: any[]) => {
    let has: boolean;

    for (let i = 0; i < array.length; i++) {
        has = false;

        for (let j = 0; j < sourceArray.length; j++) {
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
