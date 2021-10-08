import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './VisualizationLayer.scss';

function VisualizationLayer(props) {
  const { title, evalscript, evalscriptUrl, selected } = props;

  const [evalscriptText, setEvalscriptText] = useState(evalscript);
  const [showEvalscript] = useState(false);

  useEffect(() => {
    if (showEvalscript && evalscriptUrl && !evalscriptText) {
      axios.get(evalscriptUrl).then((r) => setEvalscriptText(r.data));
    }
  }, [showEvalscript, evalscriptUrl, evalscriptText]);

  return (
    <div className={`visualization-layer ${selected ? 'selected' : ''}`}>
      {selected && <div className="visualization-layer-selected-bar"></div>}
      <input
        className="visualization-layer-radio"
        type="radio"
        id={title}
        onChange={props.onSelect}
        checked={selected}
      />
      <label className="visualization-layer-label" htmlFor={title}>
        {title}
      </label>
    </div>
  );
}

export default VisualizationLayer;
