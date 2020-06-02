import { UserOptions } from '../plugin/Model/SliderModel';

type MainClasses =
  | 'jquery-slider'
  | 'jquery-slider-range'
  | 'jquery-slider-handle';

const getClassList = (elements: JQuery): UserOptions['classes'] => {
  const classList: UserOptions['classes'] = {};

  for (let i = 0; i < elements.length; i += 1) {
    const classesArray = elements[i].className.split(' ');

    const deleteCount = i === 0 ? 2 : 1;
    const mainClass = classesArray.splice(0, deleteCount);

    classList[mainClass.join(' ')] = classesArray.length !== 0 ? classesArray.join(' ') : '';
  }

  return classList;
};

export default getClassList;
