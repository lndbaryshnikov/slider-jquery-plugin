import Model from "../../MVP modules/model/model";
import arrayEquals from "../common/arrayEquals"

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

export const getSliderSettings = (userOptions, defaultOptions) => {
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