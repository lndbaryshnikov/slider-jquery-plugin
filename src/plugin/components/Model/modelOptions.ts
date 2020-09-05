type ValueFunction = (value?: Options['value']) => string | number;
type ChangeFunction = (value: number | number[]) => void;

type Options = {
  min: number;
  max: number;
  step: number;
  value: number | number[];
  orientation: 'horizontal' | 'vertical';
  range: 'min' | 'max' | boolean;
  tooltip: boolean | ValueFunction;
  animate: 'slow' | 'fast' | false | number;
  labels: true | false | ValueFunction;
  pips: boolean;
  change: ChangeFunction | false;
};

type UserOptions = Partial<Options>;
type OptionValue = UserOptions[keyof UserOptions];

const modelOptions: Options = {
  min: 0,
  max: 100,
  step: 1,
  value: 0,
  orientation: 'horizontal',
  range: false,
  tooltip: false,
  animate: 'fast',
  pips: false,
  labels: false,
  change: false,
};

export default modelOptions;
export {
  Options,
  UserOptions,
  OptionValue,
  ValueFunction,
  ChangeFunction,
};
