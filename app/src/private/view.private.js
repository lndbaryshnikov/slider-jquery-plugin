import {Model} from "../MVP modules/model/model";
import {Presenter} from "../MVP modules/presenter/presenter";
import {View} from "../MVP modules/view/view";

export const createInstance = (options) => {

    const model = new Model(options);
    const presenter = new Presenter(new View());

    presenter.model = model;

    return presenter;
};

export const getClassList = (elements) => {
    const classList = {};

    for (let i = 2; i < elements.length; i++) {

        //i = 2 cause first 'div' is mocha and second is empty - wrapper(view.private.js)
        const classesString = $(elements[i]).attr('class');
        const classesArray = classesString.split(' ');

        if(!!classesArray[1]) {

            const mainClass = classesArray[0];
            classesArray.shift();
            classList[mainClass] = classesArray.join(' ');

        } else {

            classList[classesArray[0]] = '';

        }
    }

    return classList;
};