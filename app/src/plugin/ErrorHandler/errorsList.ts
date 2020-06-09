const errorsList = {
  pluginErrors: {
    notSetUp: 'slider is not set up',
    rendered: 'slider is already rendered',
  },
  optionErrors: {
    common: {
      notAnObject: 'options should be object',
      notSet: 'options are not set',
      alreadySet: 'options are already set (to change - provide options)',
      incorrectNames: 'option names should correspond the required format',
      incorrectOptionType: (option: string, type: string): string => (
        `option ${option} should be of type ${type}`
      ),
    },
    value: {
      incorrectType: 'value can only be of type number or array',
      notCompatibleWithRange: (
        'value should be number when range is false and array when range is true'
      ),
      beyondBorders: 'value cannot go beyond min and max',
      firstMoreThanSecond: 'first value should be less than second',
      notMultipleOfStep: 'value should be multiple of step',
    },
    orientation: {
      incorrect: 'orientation can only be vertical or horizontal',
    },
    range: {
      incorrect: 'range can only equals min, max, true or false',
    },
    tooltip: {
      incorrect: 'tooltip should be true, false or function',
      incorrectFunction: 'tooltip function should return string or number',
    },
    step: {
      incorrect: 'step should be between min and max',
      notAMultiple: 'step should be a multiple of min and max difference',
    },
    animate: {
      incorrect: 'animate can only be false, slow, fast or number',
    },
    pips: {
      incorrect: 'pips can only be true or false',
    },
    labels: {
      incorrect: 'labels can only be true, false or function',
      incorrectFunction: 'labels function should return number or string',
    },
    change: {
      incorrect: 'change can only be function or false',
      incorrectFunction: 'change function accepts two arguments and return undefined',
    },
  },
};

export default errorsList;
