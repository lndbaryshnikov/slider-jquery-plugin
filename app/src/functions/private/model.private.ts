import * as $ from 'jquery';

import Model from "../../MVP modules/model/model";
import arrayEquals from "../common/arrayEquals"

export interface Options {
    min: number,
    classes: {
        "jquery-slider"?: string,
        "jquery-slider-range"?: string,
        "jquery-slider-handle"?: string
    },
    max: number,
    step: number,
    value: number,
    orientation: string,
    range: boolean | string,
}

export interface UserOptions {
    min?: number,
    classes?: {
        "jquery-slider"?: string,
        "jquery-slider-range"?: string,
        "jquery-slider-handle"?: string
    },
    max?: number,
    step?: number,
    value?: number,
    orientation?: string,
    range?: boolean | string,
}

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

export const getSliderSettings = (userOptions: UserOptions, defaultOptions: Options) => {
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

export const createModel = (options: any) => {
    return () => {
        new Model(options);
    }
};