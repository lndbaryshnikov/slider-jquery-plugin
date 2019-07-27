import {getInitialHtml} from "../../functions/private/view.private";
import {defaultOptions} from '../model/model'

const defaultClasses = defaultOptions.classes;



export default function View() {

    this.html = $(getInitialHtml(defaultClasses));
}

Object.defineProperties(View.prototype, {

    modelOptions : {
        set : function(modelOptions) {

            this.classes = modelOptions.classes;

        },
        enumerable : false
    },

    classes : {
        set : function(modelClasses) {

            for (let key in modelClasses) {

                this.html.find('.' + key).addClass(modelClasses[key]);

            }
        },
        enumerable : false
    }
});


