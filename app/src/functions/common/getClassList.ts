const addClassProperty = (
  classList: { [key: string]: string },
  classesArray: string[],
  deleteCount: number,
) => {
  const mainClass = classesArray.splice(0, deleteCount);

  // eslint-disable-next-line no-param-reassign
  classList[mainClass.join(' ')] = classesArray.length !== 0 ? classesArray.join(' ') : '';
};

type MainClasses = 'jquery-slider' | 'jquery-slider-range' | 'jquery-slider-handle';

const getClassList = (elements: JQuery): Record<MainClasses, string> => {
  const classList: any = {};

  for (let i = 0; i < elements.length; i += 1) {
    const classesArray = elements[i].className.split(' ');

    if (i === 0) {
      addClassProperty(classList, classesArray, 2);
    } else {
      addClassProperty(classList, classesArray, 1);
    }
  }

  return classList;
};

export default getClassList;
