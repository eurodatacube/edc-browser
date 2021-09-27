import React from 'react';
import Select from 'react-select';

export default function ListInputRestricted(props) {
  const { restriction, value = [], setValue, showingError, isValid, isOptional, renderError } = props;
  function onChange(val) {
    const newValue = val.map((i) => i.value);
    const isEmpty = val.length === 0;
    setValue(newValue, checkIfMeetsRestriction(newValue, restriction), isEmpty);
  }

  function checkIfMeetsRestriction(list, restriction) {
    return list.length > 0 && list.every((v) => restriction.value.includes(v));
  }

  const options = restriction.value.map((v) => ({ value: v, label: v }));

  const customStyles = {
    menu: (css) => ({
      ...css,
      background: '#2a2c37',
      borderRadius: '0px',
      marginTop: '0px',
      padding: '0px',
    }),
    control: (css) => ({
      ...css,
      color: '#eee',
      height: 'fit-content',
      padding: '5px 0',
      background: '#2a2c37',
      border: 'none',
      borderRadius: '0px',
    }),
    indicatorsContainer: (css) => ({
      ...css,
      color: '#eee',
      cursor: 'pointer',
    }),
    indicatorSeparator: (css) => ({
      display: 'none',
    }),
    placeholder: (css) => ({
      ...css,
      color: '#eee',
    }),
    option: (css) => ({
      ...css,
      fontSize: '14px',
      cursor: 'pointer',
      background: '#2a2c37',
      color: '#eee',
      ':hover': {
        background: '#1b1c23',
      },
    }),
    multiValue: (css) => ({
      ...css,
      background: '#5dbdd5',
      fontSize: '20px',
    }),

    multiValueRemove: (css) => ({
      ...css,
      ':hover': {
        color: '#eee',
        background: '#267c92',
        cursor: 'pointer',
      },
    }),
  };

  return (
    <>
      <div className={`algorithm-option-list-restricted ${showingError && !isValid ? 'invalid' : ''}`}>
        <Select
          className="react-select-container"
          options={options}
          onChange={onChange}
          styles={customStyles}
          isMulti
        />
      </div>
      {showingError &&
        renderError(
          value,
          isValid,
          isOptional,
          'Field can not be empty.',
          `Restriction is not met. At least one of these values ${restriction.value.join(
            ', ',
          )} has to be selected.`,
        )}
    </>
  );
}
