import {getInitialHtml, setClasses} from "../../functions/private/view.private";
import {defaultOptions} from '../model/model'
import {Options} from "../../functions/private/model.private";
import MouseDownEvent = JQuery.MouseDownEvent;

const defaultClasses = defaultOptions.classes;



class View {
    html: any;

    constructor() {
        this.html = $(getInitialHtml(defaultClasses));
    }

    set modelOptions(modelOptions: Options) {
            setClasses(modelOptions.classes, this.html);
    }

    set movingHandler(handler: any) {
            const handle = this.html.find('.jquery-slider-handle')[0];
            const horizontalArea = this.html.find('.jquery-slider')[0];

            $(handle).mousedown((e: MouseDownEvent) => {
                handler(handle, horizontalArea, e);
            });

            handle.ondragstart = () =>{
                return false;
            };
    }
}

export default View;




