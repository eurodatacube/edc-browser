import React, { useState } from 'react';

export default function BasicInput(props) {
  const [inputTimeoutId, setInputTimeoutId] = useState(null);
  const { type, restriction, value, setValue, showingError, isValid, isOptional, renderError } = props;
  const INPUT_TIMEOUT_DELAY = 1000;

  function setPotentialTimeoutAndValue(parsedVal) {
    if (inputTimeoutId) {
      clearTimeout(inputTimeoutId);
    }
    if (!checkIfMeetsRestriction(parsedVal, restriction)) {
      const restrictedVal = parsedVal < restriction.value[0] ? restriction.value[0] : restriction.value[1];
      const timeoutId = setTimeout(() => {
        setValue(restrictedVal, true, isEmpty(restrictedVal));
      }, INPUT_TIMEOUT_DELAY);
      setInputTimeoutId(timeoutId);
    }
    setValue(parsedVal, checkIfMeetsRestriction(parsedVal, restriction), isEmpty(parsedVal));
  }

  function getAppropriateInput(type) {
    switch (type) {
      case 'string':
        return (
          <input
            className="input-primary"
            type="text"
            value={value === undefined ? '' : value}
            onChange={(e) =>
              setValue(
                e.target.value,
                checkIfMeetsRestriction(e.target.value, restriction),
                isEmpty(e.target.value),
              )
            }
          />
        );
      case 'float':
        return (
          <input
            className="input-primary"
            type="number"
            value={value === undefined ? '' : value}
            onInput={(e) => {
              const parsedVal = parseFloat(e.target.value);
              if (e.target.value === '') {
                setValue(e.target.value, false, true);
              } else if (!isNaN(parsedVal)) {
                setPotentialTimeoutAndValue(parsedVal);
              }
            }}
          />
        );
      case 'int':
        return (
          <input
            className="input-primary"
            type="number"
            step="1"
            value={value === undefined ? '' : value}
            onInput={(e) => {
              const parsedVal = parseInt(e.target.value);
              if (e.target.value === '') {
                setValue(e.target.value, false, true);
              } else if (!isNaN(parsedVal)) {
                setPotentialTimeoutAndValue(parsedVal);
              }
            }}
          />
        );
      default:
        return null;
    }
  }

  function checkIfMeetsRestriction(val, restriction) {
    if (!restriction) {
      return true;
    }
    if (restriction.type === 'range') {
      return val >= restriction.value[0] && val <= restriction.value[1];
    } else if (restriction.type === 'choice') {
      return restriction.value.includes(val);
    }
  }

  function isEmpty(val) {
    return val === '';
  }

  return (
    <>
      <div className={`algorithm-option-string ${showingError && !isValid && !isOptional ? 'invalid' : ''}`}>
        {getAppropriateInput(type)}
        {restriction && restriction.length > 0 && (
          <div className="algorithm-option-string-restriction">
            Supported values: {restriction.join(', ')}.
          </div>
        )}
      </div>
      {showingError &&
        (restriction
          ? restriction.type === 'range'
            ? renderError(
                value,
                isValid,
                isOptional,
                'Field can not be empty.',
                `Restriction is not met. Value has to be in range [${restriction.value[0]}, ${restriction.value[1]}].`,
              )
            : renderError(
                value,
                isValid,
                isOptional,
                'Field can not be empty.',
                `Restriction is not met. At least one of these values ${restriction.value.join(
                  ', ',
                )} has to be selected.`,
              )
          : !isOptional
          ? renderError(value, isValid, isOptional, 'Field can not be empty.', 'Field can not be empty.')
          : '')}
    </>
  );
}
