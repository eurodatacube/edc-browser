import React from 'react';

export default function ListInput(props) {
  const { value = [''], setValue, showingError, isInputValid, isOptional, renderError } = props;
  function addNewElement() {
    const newValue = [...value, ''];
    setValue(newValue, isValid(newValue), isEmpty(newValue));
  }

  function removeElement() {
    const newValue = value.slice(0, value.length - 1);
    setValue(newValue, isValid(newValue), isEmpty(newValue));
  }

  function onSetValue(val, i) {
    const newValue = [...value];
    newValue[i] = val;
    setValue(newValue, isValid(newValue), isEmpty(newValue));
  }

  function isValid(list) {
    return list.length > 0 && list.every((v) => v.length > 0);
  }

  function isEmpty(list) {
    return list.length === 1 && list[0].length === 0;
  }

  return (
    <>
      <div className={`algorithm-option-list ${showingError && !isInputValid ? 'invalid' : ''}`}>
        {value.map((val, i) => (
          <input
            key={i}
            className="list-input input-primary"
            type="text"
            value={val}
            onChange={(e) => onSetValue(e.target.value, i)}
          />
        ))}
        <div className="add-and-remove">
          <div className="add-element" onClick={addNewElement}>
            <i className="fas fa-plus-circle" />
          </div>
          {value.length > 1 && (
            <div className="remove-element" onClick={removeElement}>
              <i className="fas fa-minus-circle" />
            </div>
          )}
        </div>
      </div>
      {showingError &&
        renderError(
          value,
          isInputValid,
          isOptional,
          'Field can not be empty.',
          'At least 1 value has to be selected.',
        )}
    </>
  );
}
