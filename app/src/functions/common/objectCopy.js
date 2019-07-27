export default function clone(obj) {

    function Create() {

            for ( var item in obj) {

                if(obj.hasOwnProperty(item)) {
                    this[item] = (typeof obj[item] ==
                        'object') ? clone(obj[item]) : obj[item];
                }
            }
    }

    return new Create();

}