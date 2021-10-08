import React from 'react';
import Select from 'react-select';
import styleVariables from '../../variables.module.scss';

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
      background: styleVariables.colorBgUI70,
      borderRadius: '4px',
      marginTop: '0px',
      padding: '0px',
    }),
    control: (css) => ({
      ...css,
      color: styleVariables.colorText50,
      borderRadius: styleVariables.borderRadius,
      border: 'none',
      minHeight: styleVariables.formElementBaseHeight,
      background: styleVariables.colorBgUI70,
      ':hover': {
        cursor: 'pointer',
      },
    }),
    indicatorsContainer: (css) => ({
      ...css,
      color: styleVariables.colorText50,
      cursor: 'pointer',
    }),
    selectContainer: (css) => ({
      ...css,
    }),
    clearIndicator: (css) => ({
      ...css,
      color: styleVariables.colorText50,
    }),
    indicatorSeparator: (css) => ({
      ...css,
      display: 'none',
    }),
    placeholder: (css) => ({
      ...css,
      color: styleVariables.colorText50,
    }),
    option: (css) => ({
      ...css,
      fontSize: '14px',
      cursor: 'pointer',
      background: styleVariables.colorBgUI70,
      color: styleVariables.colorText50,
    }),
    multiValue: (css) => ({
      ...css,
      fontSize: styleVariables.fontSize03,
      color: styleVariables.colorText50,
      borderRadius: '50px',
      padding: `${'1px'} ${styleVariables.spacing01}`,
      margin: 4,
      background: 'none',
      border: `1px solid ${styleVariables.colorBgLight50}`,
      display: 'flex',
      alignItems: 'center',
    }),
    multiValueLabel: (css) => ({
      ...css,
      color: styleVariables.colorText70,
    }),
    multiValueRemove: (css) => ({
      ...css,
      color: styleVariables.colortex50,
      ':hover': {
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
