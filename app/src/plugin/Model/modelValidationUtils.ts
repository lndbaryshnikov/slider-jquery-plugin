import modelOptions, { Options } from './modelOptions';
import areArraysEqual from '../../utils/areArraysEqual';

type ValidationResult = { result: boolean; errorCode?: string };

const areOptionsKeysCorrect = (options: Options): boolean => {
  const defaultOptions = { ...modelOptions };
  const optionsKeys = Object.keys(options);
  const defaultOptionsKeys = Object.keys(defaultOptions);

  return areArraysEqual(optionsKeys, defaultOptionsKeys);
};

const findIncorrectTypeOption = (
  options: Options,
  type: 'string' | 'number' | 'boolean',
  ...optionNames: (keyof Options)[]
): keyof Options => {
  const incorrectOption = optionNames.find((key) => typeof options[key] !== type);

  return incorrectOption;
};

//-----------------------------------
// --- VALUE VALIDATION ---
//-----------------------------------

const validateValue = (options: Options): ValidationResult => {
  const {
    value, min, max, step, range,
  } = options;

  // --- HELPERS ---

  const isValueArray = Array.isArray(value);
  const isRangeTrue = range === true;

  const isValueNotCorrect = typeof value !== 'number' && !Array.isArray(value);
  const isValueNotCompatibleWithRange = (
    (!isRangeTrue && isValueArray) || (isRangeTrue && !isValueArray)
  );

  const isValueNotBetweenMinAndMax = (values: number[]): boolean => {
    const incorrectValue = values.find((current) => !(min <= current && max >= current));

    return typeof incorrectValue === 'number';
  };

  const isStepNotAMultipleOfValue = (values: number[]): boolean => {
    const incorrectValue = values.find((current) => (current - min) % step !== 0);

    return typeof incorrectValue === 'number';
  };

  // --- MAIN ---

  if (isValueNotCorrect) {
    return { result: false, errorCode: 'incorrectType' };
  }

  if (isValueNotCompatibleWithRange) {
    return { result: false, errorCode: 'notCompatibleWithRange' };
  }

  if (Array.isArray(value)) {
    const [first, second] = value;

    if (second <= first) {
      return { result: false, errorCode: 'firstMoreThanSecond' };
    }
  }

  const preparedValue = Array.isArray(value) ? value : [value];

  if (isValueNotBetweenMinAndMax(preparedValue)) {
    return { result: false, errorCode: 'beyondBorders' };
  }

  if (isStepNotAMultipleOfValue(preparedValue)) {
    return { result: false, errorCode: 'notMultipleOfStep' };
  }

  return { result: true };
};

//-----------------------------------
// --- ORIENTATION VALIDATION ---
//-----------------------------------

const validateOrientation = (options: Options): ValidationResult => {
  // --- HELPERS ---
  const { orientation } = options;

  const isOrientationNotCorrect = (
    orientation !== 'horizontal'
    && orientation !== 'vertical'
  );

  // --- MAIN ---

  if (isOrientationNotCorrect) {
    return { result: false, errorCode: 'incorrect' };
  }

  return { result: true };
};

//-----------------------------------
// --- RANGE VALIDATION ---
//-----------------------------------

const validateRange = (options: Options): ValidationResult => {
  // --- HELPERS
  const { range } = options;

  const isRangeNotCorrect = (
    range !== 'min' && range !== 'max' && typeof range !== 'boolean'
  );

  // --- MAIN ---
  if (isRangeNotCorrect) {
    return { result: false, errorCode: 'incorrect' };
  }

  return { result: true };
};

//-----------------------------------
// --- STEP VALIDATION ---
//-----------------------------------

const validateStep = (options: Options): ValidationResult => {
  // --- HELPERS ---
  const { min, max, step } = options;

  const isStepNotCorrect = step > max - min || step <= 0;
  const isStepNotAMultipleOfMinAndMaxDifference = (max - min) % step !== 0;

  // --- MAIN ---
  if (isStepNotCorrect) {
    return { result: false, errorCode: 'incorrect' };
  }

  if (isStepNotAMultipleOfMinAndMaxDifference) {
    return { result: false, errorCode: 'notAMultiple' };
  }

  return { result: true };
};

//-----------------------------------
// --- TOOLTIP VALIDATION ---
//-----------------------------------

const validateTooltip = (options: Options): ValidationResult => {
  // --- HELPERS ---
  const { tooltip, value } = options;

  const isTooltipIncorrect = typeof tooltip !== 'boolean'
    && typeof tooltip !== 'function';

  const isTooltipFunctionIncorrect = typeof tooltip === 'function'
    && typeof tooltip(value) !== 'number'
    && typeof tooltip(value) !== 'string';

  // --- MAIN ---
  if (isTooltipIncorrect) {
    return { result: false, errorCode: 'incorrect' };
  }

  if (isTooltipFunctionIncorrect) {
    return { result: false, errorCode: 'incorrectFunction' };
  }

  return { result: true };
};

//-----------------------------------
// --- ANIMATE VALIDATION ---
//-----------------------------------

const validateAnimate = (options: Options): ValidationResult => {
  // --- HELPERS ---
  const { animate } = options;

  const isAnimateNotCorrect = (
    animate !== false
    && animate !== 'slow'
    && animate !== 'fast'
    && typeof animate !== 'number'
  );

  // --- MAIN ---
  if (isAnimateNotCorrect) {
    return { result: false, errorCode: 'incorrect' };
  }

  return { result: true };
};

//-----------------------------------
// --- LABELS VALIDATION ---
//-----------------------------------

const validateLabels = (options: Options): ValidationResult => {
  // --- HELPERS ---
  const { value, labels } = options;

  const isLabelsNotCorrect = typeof labels !== 'function'
    && typeof labels !== 'boolean';

  const isFunctionReturnIncorrectValue = typeof labels === 'function'
    && typeof labels(value) !== 'string'
    && typeof labels(value) !== 'number';

  // --- MAIN ---
  if (isLabelsNotCorrect) {
    return { result: false, errorCode: 'incorrect' };
  }

  if (isFunctionReturnIncorrectValue) {
    return { result: false, errorCode: 'incorrectFunction' };
  }

  return { result: true };
};

//-----------------------------------
// --- PIPS VALIDATION ---
//-----------------------------------

const validatePips = (options: Options): ValidationResult => {
  // -- HELPERS --
  const { pips } = options;

  const arePipsNotCorrect = typeof pips !== 'boolean';

  // -- MAIN --

  if (arePipsNotCorrect) {
    return { result: false, errorCode: 'incorrect' };
  }

  return { result: true };
};

//-----------------------------------
// --- CHANGE VALIDATION ---
//-----------------------------------

const validateChange = (options: Options): ValidationResult => {
  // --- HELPERS ---
  const { change, value } = options;

  const isChangeIncorrect = typeof change !== 'function'
    && change !== false;

  const isChangeFunctionIncorrect = typeof change === 'function'
    && typeof change(value) !== 'undefined';

  // --- MAIN ---
  if (isChangeIncorrect) {
    return { result: false, errorCode: 'incorrect' };
  }

  if (isChangeFunctionIncorrect) {
    return { result: false, errorCode: 'incorrectFunction' };
  }

  return { result: true };
};

const modelValidationUtils = {
  areOptionsKeysCorrect,
  findIncorrectTypeOption,
  validateOrientation,
  validateValue,
  validateStep,
  validateTooltip,
  validateLabels,
  validatePips,
  validateChange,
  validateRange,
  validateAnimate,
};

export default modelValidationUtils;
