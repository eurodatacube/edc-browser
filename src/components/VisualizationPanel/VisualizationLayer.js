import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Loader from '../Loader/Loader';
import './VisualizationLayer.scss';

function VisualizationLayer(props) {
  const { title, evalscript, evalscriptUrl, selected } = props;

  const [evalscriptText, setEvalscriptText] = useState(evalscript);
  const [showEvalscript, setShowEvalscript] = useState(false);

  useEffect(() => {
    if (showEvalscript && evalscriptUrl && !evalscriptText) {
      axios.get(evalscriptUrl).then((r) => setEvalscriptText(r.data));
    }
  }, [showEvalscript, evalscriptUrl, evalscriptText]);

  return (
    <div className={`visualization-layer ${selected ? 'selected' : ''}`}>
      <div className="main-row">
        <div className="title" onClick={props.onSelect}>
          {title}
        </div>
        {(evalscript || evalscriptUrl) && (
          <button
            className="expand-collapse-evalscript button-primary"
            onClick={() => setShowEvalscript((prevState) => !prevState)}
          >
            Evalscript
            {showEvalscript ? <i className="fa fa-chevron-up" /> : <i className="fa fa-chevron-down" />}
          </button>
        )}
      </div>
      {showEvalscript && (
        <div className="evalscript-holder">{evalscriptText ? <pre>{evalscriptText}</pre> : <Loader />}</div>
      )}
    </div>
  );
}

export default VisualizationLayer;
