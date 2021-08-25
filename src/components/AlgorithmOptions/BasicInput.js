import React from 'react';

export default function BasicInput({ type, restriction, value, setValue }) {
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
                setValue(e.target.value, false);
              } else if (!isNaN(parsedVal)) {
                setValue(parsedVal, checkIfMeetsRestriction(parsedVal, restriction), isEmpty(e.target.value));
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
                setValue(e.target.value, false);
              } else if (!isNaN(parsedVal)) {
                setValue(parsedVal, checkIfMeetsRestriction(parsedVal, restriction), isEmpty(e.target.value));
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
    <div className="algorithm-option-string">
      {getAppropriateInput(type)}
      {restriction && restriction.length > 0 && (
        <div className="algorithm-option-string-restriction">Supported values: {restriction.join(', ')}.</div>
      )}
    </div>
  );
}
