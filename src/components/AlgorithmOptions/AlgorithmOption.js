import React from 'react';

import BasicInput from './BasicInput';
import DateRangeInput from './DateRangeInput';
import ListInput from './ListInput';
import ListInputRestricted from './ListInputRestricted';
import AOIAlgorithmOption from './AOIAlgorithmOption';
import InfoTooltip from '../InfoTooltip/InfoTooltip';

function AlgorithmOption(props) {
  const { type, id, name, description, restriction, setAlgorithmParameter, value, isValid = false } = props;

  function setValue(value, isValid, isEmpty) {
    setAlgorithmParameter(id, value, isValid, isEmpty);
  }

  function renderInput(type) {
    if (type === 'bbox') {
      return (
        <AOIAlgorithmOption
          id={id}
          name={name}
          value={value}
          setAlgorithmParameter={setAlgorithmParameter}
          restriction={restriction}
        />
      );
    } else if (type === 'daterange') {
      return <DateRangeInput restriction={restriction} value={value} setValue={setValue} />;
    } else if (type === 'stringlist') {
      if (restriction && restriction.value.length > 0) {
        return <ListInputRestricted restriction={restriction} value={value} setValue={setValue} />;
      }
      return <ListInput value={value} setValue={setValue} />;
    } else {
      return <BasicInput type={type} restriction={restriction} value={value} setValue={setValue} />;
    }
  }

  return (
    <div className={`panel-section option ${isValid ? '' : 'invalid'}`}>
      <div className="option-header">
        <div className="label-primary">{name}</div>
        {description && description.length > 0 && (
          <div className="option-description">
            <InfoTooltip text={description} />
          </div>
        )}
      </div>
      {renderInput(type)}
    </div>
  );
}

export default AlgorithmOption;
