import React, { useState } from 'react';

import AlgorithmOption from './AlgorithmOption';
import EDCHandler from '../../services/EDCHandler';

import './AlgorithmOptions.scss';

function AlgorithmOptions({ options, algorithm, defaultValues }) {
  const [algorithmParams, setAlgorithmParams] = useState(defaultValues);
  const [showingError, setShowingError] = useState(false);
  const [canPurchaseBtnBeDisabled, setCanPurchaseBtnBeDisabled] = useState(false);

  function setAlgorithmParameter(paramId, paramValue, isValid, isEmpty) {
    setAlgorithmParams((prevState) => ({
      ...prevState,
      [paramId]: { value: paramValue, isValid: isValid, isEmpty: isEmpty },
    }));
  }

  function checkIfAllParamsValid(selectedOptions, allOptions) {
    const selectedOptionsIds = Object.keys(selectedOptions);

    return allOptions.every(
      ({ id, optional }) =>
        (optional && !selectedOptionsIds.includes(id)) || // Optional, and no value is set.
        (optional && selectedOptionsIds.includes(id) && selectedOptions[id].isEmpty) || // Optional, but an empty value is set.
        (selectedOptionsIds.includes(id) && selectedOptions[id].isValid), // Value is set and it's valid
    );
  }

  function constructInputValuesFromAlgorithmParams(algorithmParams, allOptions) {
    const inputValues = {};
    for (let paramId in algorithmParams) {
      if (algorithmParams[paramId].isValid && !algorithmParams[paramId].isEmpty) {
        inputValues[paramId] = algorithmParams[paramId].value;
      }
    }
    return inputValues;
  }

  function submitPurchase() {
    setShowingError(true);
    const allValid = checkIfAllParamsValid(algorithmParams, options);
    if (!allValid) {
      setCanPurchaseBtnBeDisabled(true);
      return;
    }
    const inputValues = constructInputValuesFromAlgorithmParams(algorithmParams, options);
    const checkoutUrl = EDCHandler.getCheckoutUrl(algorithm, inputValues);
    window.open(checkoutUrl, '_blank');
  }

  return (
    <div className="algorithm-options">
      {options.map(({ type, id, name, description, restriction, optional }, i) => (
        <AlgorithmOption
          key={`${algorithm}-${id}`}
          value={algorithmParams[id] && algorithmParams[id].value}
          isValid={algorithmParams[id] && algorithmParams[id].isValid}
          showingError={showingError}
          type={type}
          id={id}
          name={name}
          description={description}
          restriction={restriction}
          isOptional={optional}
          setAlgorithmParameter={setAlgorithmParameter}
        />
      ))}
      <button
        className={`button-primary purchase-button ${
          canPurchaseBtnBeDisabled && !checkIfAllParamsValid(algorithmParams, options) ? 'disabled' : ''
        }`}
        onClick={submitPurchase}
      >
        Purchase
      </button>
    </div>
  );
}

export default AlgorithmOptions;
