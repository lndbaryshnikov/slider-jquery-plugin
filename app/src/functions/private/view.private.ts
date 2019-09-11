// import $ from 'jquery';

import {Options} from "../../MVP modules/Slider/SliderModel";
import getCoords, {Coords} from "../common/getCoords";

export const getClassList = (elements: JQuery): Object => {
    const classList: any = {};

    for (let i = 0; i < elements.length; i++) {
        //i = 2 cause first 'div' is mocha and second is empty - wrapper
        const classesArray = elements[i].className.split(' ');

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