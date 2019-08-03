import $ from 'jquery'

import getCoords from "../common/getCoords";

export const countShift = (event, elem) => {
    const elemCoords = getCoords(elem);

    return {
        x: event.pageX - elemCoords.left,
        y: event.pageY - elemCoords.top
    };
};

export const movingHandlerOnAxisX = (handle, horizontalArea, event) => {
    const shift = countShift(event, handle);

    $(document).mousemove((event) => {
        const handleCoords = countHandleCoords(horizontalArea, handle, event, shift);

        $(handle).css('left', handleCoords + 'px');
    });

    $(document).mouseup(() => {
        $(document).unbind('mousemove');
        $(document).unbind('mouseup');
    });

    return false;
};

const countHandleCoords = (horizontalArea, handle, event, shift) => {
    const handleCoords = getCoords(handle);
    const areaCoords = getCoords(horizontalArea);

    const shiftX = shift.x;

    let newLeft = event.pageX - shiftX - areaCoords.left;

    if (newLeft < 0) newLeft = 0;

    const rightEdge = areaCoords.width - handleCoords.width;

    if (newLeft > rightEdge) newLeft = rightEdge;

    return newLeft;
};