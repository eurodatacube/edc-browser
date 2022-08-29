import React from 'react';
import moment from 'moment';

import BasicInput from './BasicInput';
import DateRangeInput from './DateRangeInput';
import ListInput from './ListInput';
import ListInputRestricted from './ListInputRestricted';
import AOIAlgorithmOption from './AOIAlgorithmOption';
import InfoTooltip from '../InfoTooltip/InfoTooltip';
import DateInput from '../EdcDataPanel/CommercialDataPanel/Search/DateInput';

import { ALGORITHM_TYPES } from '../../const';
import { momentToISODate } from '../../utils';
import './AlgorithmOption.scss';

function AlgorithmOption(props) {
  const {
    type,
    id,
    name,
    description,
    restriction,
    setAlgorithmParameter,
    value,
    isValid,
    isOptional,
    showingError,
  } = props;

  function setValue(value, isValid, isEmpty) {
    setAlgorithmParameter(id, value, isValid, isEmpty);
  }

  const renderError = (value, isValid, isOptional, missingValueMsg, invalidValueMsg) => {
    let errorMsg;
    if (!value && !isOptional) {
      errorMsg = missingValueMsg;
    } else if (!isValid) {
      errorMsg = invalidValueMsg;
    }
    return <div className="error-msg">{errorMsg}</div>;
  };

  function renderInput(type) {
    if (type === ALGORITHM_TYPES.bbox) {
      return (
        <AOIAlgorithmOption
          id={id}
          name={name}
          value={value}
          setAlgorithmParameter={setAlgorithmParameter}
          restriction={restriction}
          showingError={showingError}
          isValid={isValid}
          isOptional={isOptional}
          renderError={renderError}
        />
      );
    } else if (type === ALGORITHM_TYPES.daterange) {
      return (
        <DateRangeInput
          restriction={restriction}
          value={value}
          setValue={setValue}
          showingError={showingError}
          isValid={isValid}
          isOptional={isOptional}
          renderError={renderError}
        />
      );
    } else if (type === ALGORITHM_TYPES.date) {
      return (
        <div className="date-picker-single-date">
          <DateInput
            value={moment.utc(value)}
            onChangeHandler={(name, value) => setValue(momentToISODate(value), true)}
            name="algorithm"
          />
        </div>
      );
    } else if (type === ALGORITHM_TYPES.stringlist) {
      if (restriction && restriction.value.length > 0) {
        return (
          <ListInputRestricted
            restriction={restriction}
            showingError={showingError}
            value={value}
            setValue={setValue}
            isValid={isValid}
            isOptional={isOptional}
            renderError={renderError}
          />
        );
      }
      return (
        <ListInput
          value={value}
          showingError={showingError}
          isInputValid={isValid}
          isOptional={isOptional}
          setValue={setValue}
          renderError={renderError}
        />
      );
    } else {
      return (
        <BasicInput
          type={type}
          restriction={restriction}
          showingError={showingError}
          value={value}
          setValue={setValue}
          isValid={isValid}
          isOptional={isOptional}
          renderError={renderError}
        />
      );
    }
  }

  return (
    <div className="panel-section option">
      <div className="option-header">
        <div className="label-primary">{name}</div>
        {description && description.length > 0 && (
          <div className="option-description">
            <InfoTooltip text={description} setOpenTooltipId={() => null} />
          </div>
        )}
      </div>
      {renderInput(type)}
    </div>
  );
}

export default AlgorithmOption;
