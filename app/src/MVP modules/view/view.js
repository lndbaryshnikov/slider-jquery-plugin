import {getInitialHtml, setClasses} from "../../functions/private/view.private";
import {defaultOptions} from '../model/model'

const defaultClasses = defaultOptions.classes;



export default function View() {

    this.html = $(getInitialHtml(defaultClasses));
}

Object.defineProperties(View.prototype, {

    modelOptions : {
        set : function(modelOptions) {

            setClasses(modelOptions.classes, this.html);

        },
        enumerable : false
    },

    movingHandler : {
        set : function(handler) {
            const handle = this.html.find('.jquery-slider-handle')[0];
            const horizontalArea = this.html.find('.jquery-slider')[0];

            $(handle).mousedown((e) => {

                handler(handle, horizontalArea, e);

            });

            handle.ondragstart = () =>{
                return false;
            };

        },
        enumerable : false
    }

});





