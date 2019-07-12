const arrayEquals = (array_1, array_2) => {

    if (!array_1 || !array_2) return false;

    if (array_1.length != array_2.length) return false;

    for (let i = 0; i < array_1.length; i++) {
        // Check if we have nested arrays
        if (array_1[i] instanceof Array && array_2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array_1[i].equals(array_2[i])) return false;
        }
        else if (array_1[i] != array_2[i]) {
            // Warning - two different object instances
            // will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};


export default function Model( userOptions ) {

    const defaultOptions = {
        min: 0,
        classes: {
            "jquery-slider": "",
            "jquery-slider-range": "",
            "jquery-slider-handle": ""
        },
        max: 100,
        step: 1,
        value: 1,
        orientation: "horizontal",
        range: false,
    };

    let settings = Object.assign({}, defaultOptions);

    if ( userOptions ) {

        if(typeof userOptions !== 'object') {

            throw new Error('Options are incorrect(should be an object)');

        }

        settings = $.extend(settings, userOptions);

        if (!arrayEquals(Object.keys(settings), Object.keys(defaultOptions))) {

            throw new Error('Options are incorrect(should correspond the required format)');

        }
    }

    Object.defineProperties(this, {

        options : {
            get : function() {
                return settings;
            },
            enumerable : false
        },

    })

}
