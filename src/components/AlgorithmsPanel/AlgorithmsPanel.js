import React, { useState, useEffect } from 'react';

import Loader from '../Loader/Loader';
import AlgorithmOptions from '../AlgorithmOptions/AlgorithmOptions';
import OptionsHandler from '../AlgorithmOptions/OptionsHandler';

import './AlgorithmsPanel.scss';

function AlgorithmsPanel(props) {
  const [algorithm, setAlgorithm] = useState();
  const { algorithmsList, fetchingInProgress } = props;

  useEffect(() => {
    if (!algorithm && algorithmsList.length > 0) {
      setAlgorithm(algorithmsList[0].link);
    }
    // eslint-disable-next-line
  }, [algorithmsList]);

  const algorithmsExist = algorithmsList.length > 0;

  return (
    <div className="algorithms-panel panel-content-wrap">
      {fetchingInProgress ? (
        <Loader />
      ) : (
        <>
          <div className="panel-section">
            <div className="title-label label-primary">Algorithm</div>
            <select
              className="dropdown-primary"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              {algorithmsExist &&
                algorithmsList.map((a, i) => (
                  <option key={i} value={a.link}>
                    {a.name}
                  </option>
                ))}
            </select>
          </div>
          {algorithmsExist && (
            <OptionsHandler algorithm={algorithmsList.find((a) => a.link === algorithm)}>
              {({ options, defaultValues }) => (
                <AlgorithmOptions
                  key={algorithm}
                  algorithm={algorithm}
                  options={options}
                  defaultValues={defaultValues}
                />
              )}
            </OptionsHandler>
          )}
        </>
      )}
    </div>
  );
}

export default AlgorithmsPanel;
