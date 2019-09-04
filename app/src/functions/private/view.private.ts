import * as $ from 'jquery';

import SliderModel from "../../MVP modules/Slider/_model";
import SliderPresenter from "../../MVP modules/Slider/presenter";
import SliderView from "../../MVP modules/Slider/_view";
import getCoords, {Coords} from "../common/getCoords";
import {Options, UserOptions} from "./model.private";

interface Instance {
    createDom: () => void,
    removeDom: () => void
    }

export const createInstance = (options?: UserOptions, rootObj: string = 'body'): Instance => {
    const presenter = new SliderPresenter(new SliderView(), new SliderModel(options));

    const createDom = () => {
        $(rootObj).append(presenter._view.html);
    };

    const removeDom = () => {
        presenter._view.html.remove();
    };

    return {
        createDom: createDom,
        removeDom: removeDom
    };
};

export const getClassList = (elements: JQuery): Object => {
    const classList: any = {};

    for (let i = 1; i < elements.length; i++) {
        //i = 2 cause first 'div' is mocha and second is empty - wrapper(_view.private.js)
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



export const setClasses = (classes: IClasses, html: JQuery): void => {

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