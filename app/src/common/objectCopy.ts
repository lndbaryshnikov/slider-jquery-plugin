const clone = <CustomObject>(obj: CustomObject): CustomObject => {
  class Create {
    constructor() {
      Object.keys(obj).forEach((item) => {
        if (Object.prototype.hasOwnProperty.call(obj, item)) {
          this[item] = typeof obj[item] === 'object' ? clone(obj[item]) : obj[item];
        }
      });
    }
  }

  return new Create() as CustomObject;
};

export default clone;
