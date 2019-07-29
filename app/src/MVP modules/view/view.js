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

});





