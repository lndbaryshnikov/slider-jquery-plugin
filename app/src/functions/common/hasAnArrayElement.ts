export const hasAnArrayElements = (array_checking: any[], source: any[]) => {
    let has = false;

    for (let i = 0; i < array_checking.length; i++) {
        for (let j = 0; j < source.length; j++) {
            if (array_checking[i] === source[j]) {
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