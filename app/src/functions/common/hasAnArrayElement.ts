export const hasAnArrayElements = (array_checking: any[], source: any[]) => {
    let has: boolean;

    for (let i = 0; i < array_checking.length; i++) {
        has = false;

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