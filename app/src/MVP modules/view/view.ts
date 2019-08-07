import {getInitialHtml, setClasses} from "../../functions/private/view.private";
import {defaultOptions} from '../model/model'
import {Options} from "../../functions/private/model.private";
import MouseDownEvent = JQuery.MouseDownEvent;
import MouseMoveEvent = JQuery.MouseMoveEvent;
import {countShift, Shift} from "../../functions/private/presenter.private";

const defaultClasses = defaultOptions.classes;

interface SliderView {
    html: JQuery;
}

class View implements SliderView {
    html: JQuery;

    constructor() {
        this.html = $(getInitialHtml(defaultClasses));
    }

    set modelOptions(modelOptions: Options) {
            setClasses(modelOptions.classes, this.html);
    }

    set whenUserMovesHandler(countHandlerCoords: (handle: HTMLElement, horizontalArea: HTMLElement,
                                       handleShift: Shift, mousemoveEvent: MouseMoveEvent) => number) {
            const handle = this.html.find('.jquery-slider-handle')[0];
            const horizontalArea = this.html.find('.jquery-slider')[0];

            //Drag'n'Drop code
            $(handle).mousedown((mousedownEvent: MouseDownEvent) => {
                const handleShift = countShift(mousedownEvent, handle);

                $(document).mousemove((mousemoveEvent: MouseMoveEvent) => {
                    const handleCoords = countHandlerCoords(handle, horizontalArea, handleShift, mousemoveEvent);

                    $(handle).css('left', handleCoords + 'px');
                });

                $(document).mouseup(() => {
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                });

                return false;
            });

            handle.ondragstart = () =>{
                return false;
            };
    }
}

export default View;




