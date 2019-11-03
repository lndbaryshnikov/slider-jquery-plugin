const clone = (obj) => {
    class Create {
        constructor() {
            for (const item in obj) {
                if (obj.hasOwnProperty(item)) {
                    this[item] = (typeof obj[item] ===
                        "object") ? clone(obj[item]) : obj[item];
                }
            }
        }
    }

    return new Create();
};

export default clone;
