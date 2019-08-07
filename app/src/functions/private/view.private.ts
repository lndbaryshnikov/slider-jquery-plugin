//import $ from 'jquery';

import Model from "../../MVP modules/model/model";
import Presenter from "../../MVP modules/presenter/presenter";
import View from "../../MVP modules/view/view";
import getCoords, {Coords} from "../common/getCoords";
import {Options, UserOptions} from "./model.private";

interface Instance {
    createDom: () => void,
    removeDom: () => void
    }

export const createInstance = (options?: UserOptions, rootObj: string = 'body'): Instance => {
    const presenter = new Presenter(new View(), new Model(options));

    const createDom = () => {
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

export const getClassList = (elements: JQuery): Object => {
    const classList: any = {};

    for (let i = 2; i < elements.length; i++) {
        //i = 2 cause first 'div' is mocha and second is empty - wrapper(view.private.js)
        const classesString = $(elements[i]).attr('class');
        const classesArray = classesString.split(' ');

        if(!!classesArray[1]) {
            const mainClass = classesArray.shift();

            classList[mainClass] = classesArray.join(' ');
        } else {
            classList[classesArray[0]] = '';
        }
    }

    return classList;
};

export const getInitialHtml = (defaultClasses: Options["classes"]): string => {
    const keys = Object.keys(defaultClasses);

    return `<div><div class=${keys[0]}>` +
        `<div class=${keys[1]}>` +
        `<div class=${keys[2]}>` +
        `</div></div></div></div>`;
};

interface IClasses {
    [key: string]: string;
}

export const setClasses = (classes: IClasses, html: JQuery): void => {
    let key: keyof IClasses;

    for (key in classes) {
        html.find('.' + key).addClass(classes[key]);
    }
};

export const createEvent = (type: string, x?: number | string, y?: number | string): JQuery.Event => {
  const e = $.Event(type);

  if (x !== "empty") {
      if (typeof x === "number") {
          e.pageX = x;
      }
  }

  if (y !== "empty"){
      if (typeof y === "number") {
          e.pageY = y;
      }
  }

  return e;
};


interface HandleCoords extends Coords{}

export const moveHandleToCertainCoords = (X: number): HandleCoords => {
    const handle = $('.jquery-slider-handle')[0];
    const handleCoords = getCoords(handle);

    const mousedownEvent = createEvent('mousedown', handleCoords.left, handleCoords.top);
    $(handle).trigger(mousedownEvent);

    const mousemoveEvent = createEvent('mousemove', X, handleCoords.top);
    $(document).trigger(mousemoveEvent);

    $(handle).trigger('mouseup');

    return getCoords(handle);
};