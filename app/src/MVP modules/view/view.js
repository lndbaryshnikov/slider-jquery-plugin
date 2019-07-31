import {getInitialHtml, setClasses} from "../../functions/private/view.private";
import {defaultOptions} from '../model/model'

const defaultClasses = defaultOptions.classes;



export default function View() {

    this.html = $(getInitialHtml(defaultClasses));
}

Object.defineProperties(View.prototype, {

    modelOptions : {
        set : function(modelOptions) {

            //setting classes
            setClasses(modelOptions.classes, this.html);

        },
        enumerable : false
    },

    movingHandler : {
        set : function(handler) {
            const handle = this.html.find('.jquery-slider-handle');
            const horizontalArea = this.html.find('.jquery-slider');

            handle.mousedown((e) => {

                handler(handle[0], horizontalArea[0], e);

            });

            handle[0].ondragstart = () =>{
                return false;
            };

        },
        enumerable : false
    }

});





