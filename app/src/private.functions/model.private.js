import {Model} from "../MVP modules/model/model";

export const arrayEquals = (array_1, array_2) => {

    if (!array_1 || !array_2) return false;

    if (array_1.length !== array_2.length) return false;

    for (let i = 0; i < array_1.length; i++) {
        // Check if we have nested arrays
        if (array_1[i] instanceof Array && array_2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array_1[i].equals(array_2[i])) return false;
        }
        else if (array_1[i] !== array_2[i]) {
            // Warning - two different object instances
            // will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

export const hasAnArrayElements = (array_checking, source) => {

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

export const getCorrectOptions = (userOptions, defaultOptions) => {

    let settings = Object.assign({}, defaultOptions);

    if ( userOptions ) {

        if(typeof userOptions !== 'object') {

            throw new Error('Options are incorrect(should be an object)');

        }

        settings = $.extend(settings, userOptions);

        if (!arrayEquals(Object.keys(settings), Object.keys(defaultOptions))) {

            throw new Error('Options are incorrect(should correspond the required format)');

        }

        if (userOptions.classes) {

            if (!hasAnArrayElements(Object.keys(userOptions.classes),
                Object.keys(defaultOptions.classes))) {

                throw new Error('Options are incorrect' +
                    '(classes should correspond the required format)');
            }
        }
    }

    return settings;
};

export const createModel = (options) => {

    return () => {
        new Model(options);
    }

};