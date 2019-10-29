const addClassProperty = (classList: { [key: string]: string }, classesArray: string[], deleteCount: number) => {
    const mainClass = classesArray.splice(0, deleteCount);

    classList[mainClass.join(' ')] = classesArray.length !== 0 ? classesArray.join(' ') : '';
};

export const getClassList = (elements: JQuery): Object => {
    const classList: any = {};

    for (let i = 0; i < elements.length; i++) {
        //i = 2 cause first 'div' is mocha and second is empty - wrapper
        const classesArray = elements[i].className.split(' ');


        if ( i === 0 ) {
            addClassProperty(classList, classesArray, 2);
        } else {
            addClassProperty(classList, classesArray, 1);
        }


        //     if(!!classesArray[1]) {
        //         const mainClass = classesArray.shift();
        //
        //         classList[mainClass] = classesArray.join(' ');
        //     } else {
        //         classList[classesArray[0]] = '';
        //     }
    }

    return classList;
};