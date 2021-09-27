import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import Loader from '../Loader/Loader';
import AlgorithmOptions from '../AlgorithmOptions/AlgorithmOptions';
import OptionsHandler from '../AlgorithmOptions/OptionsHandler';
import store, { algorithmsSlice } from '../../store';
import ExternalLink from '../ExternalLink/ExternalLink';

import './AlgorithmsPanel.scss';

const ALGORITHM_DOES_NOT_EXIST_ID = 'ALGORITHM_DOES_NOT_EXIST';

function AlgorithmsPanel(props) {
  const { algorithm, algorithmsList, fetchingInProgress } = props;

  useEffect(() => {
    if (!algorithm && algorithmsList.length > 0) {
      store.dispatch(algorithmsSlice.actions.setSelectedAlgorithm(algorithmsList[0].name));
    }
    // eslint-disable-next-line
  }, [algorithmsList]);

  const algorithmsExist = algorithmsList.length > 0;

  const algorithmInfo = algorithmsList.find((a) => a.name === algorithm);
  const algorithmDefinitionExists = !!algorithmInfo;

  return (
    <div className="algorithms-panel panel-content-wrap">
      <div className="algorithms-about">
        Select one of the available algorithms and order processing for your area of interest,{' '}
        <ExternalLink href="https://eurodatacube.com/marketplace/data-products/on-demand">
          more information
        </ExternalLink>
        .
      </div>

      {fetchingInProgress ? (
        <Loader />
      ) : (
        <>
          <div className="panel-section">
            <div className="title-label label-primary">Algorithm</div>
            <select
              className="dropdown-primary"
              value={algorithmDefinitionExists ? algorithm : ALGORITHM_DOES_NOT_EXIST_ID}
              onChange={(e) => store.dispatch(algorithmsSlice.actions.setSelectedAlgorithm(e.target.value))}
            >
              {!algorithmDefinitionExists && (
                <option key={ALGORITHM_DOES_NOT_EXIST_ID} value={ALGORITHM_DOES_NOT_EXIST_ID}></option>
              )}
              {algorithmsExist &&
                algorithmsList.map((a, i) => (
                  <option key={i} value={a.name}>
                    {a.name}
                  </option>
                ))}
            </select>
          </div>
          {algorithmsExist && algorithmDefinitionExists && (
            <OptionsHandler algorithm={algorithmInfo}>
              {({ options, defaultValues }) => (
                <AlgorithmOptions
                  key={algorithm}
                  algorithm={algorithmInfo.name}
                  options={options}
                  defaultValues={defaultValues}
                />
              )}
            </OptionsHandler>
          )}
          {!algorithmDefinitionExists && (
            <div className="algorithm-error">Algorithm "{algorithm}" does not exist.</div>
          )}
        </>
      )}
    </div>
  );
}
const mapStoreToProps = (store) => ({
  algorithm: store.algorithms.selectedAlgorithm,
});

export default connect(mapStoreToProps, null)(AlgorithmsPanel);
