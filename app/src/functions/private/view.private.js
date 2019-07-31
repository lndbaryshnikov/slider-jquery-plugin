import Model from "../../MVP modules/model/model";
import Presenter from "../../MVP modules/presenter/presenter";
import View from "../../MVP modules/view/view";
import getCoords from "../common/getCoords";

export const createInstance = (options, rootObj) => {
    const model = new Model(options);
    const presenter = new Presenter(new View());

    presenter.model = model;

    const createDom = () => {
        if ( !rootObj ) rootObj = 'body';

        $(rootObj).append(presenter.view.html);
    };

    const removeDom = () => {
        presenter.view.html.remove();
    };

    return {
        createDom: createDom,
        removeDom: removeDom
    };
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

export const getInitialHtml = (defaultClasses) => {
    const keys = Object.keys(defaultClasses);

    return `<div><div class=${keys[0]}>` +
        `<div class=${keys[1]}>` +
        `<div class=${keys[2]}>` +
        `</div></div></div></div>`;
};

export const setClasses = (classes, html) => {
    for (let key in classes) {
        html.find('.' + key).addClass(classes[key]);
    }
};

export const createEvent = (type, x, y) => {
  const e = $.Event(type);

  if (x !== "empty") {
      e.pageX = x;
  }

  if (y !== "empty"){
      e.pageY = y;
  }

  return e;
};

export const moveHandleToCertainCoords = (X) => {
    const handle = $('.jquery-slider-handle')[0];
    const handleCoords = getCoords(handle);

    const mousedownEvent = createEvent('mousedown', handleCoords.left, handleCoords.top);
    $(handle).trigger(mousedownEvent);

    const mousemoveEvent = createEvent('mousemove', X, handleCoords.top);
    $(document).trigger(mousemoveEvent);

    $(handle).trigger('mouseup');

    return getCoords(handle);
};