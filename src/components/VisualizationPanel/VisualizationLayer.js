import React from 'react';

import './VisualizationLayer.scss';

function VisualizationLayer(props) {
  const { title, evalscriptUrl, selected } = props;

  return (
    <div className="visualization-layer-container">
      <div className="visualization-layer" onClick={props.onSelect}>
        {selected && <div className="visualization-layer-selected-bar"></div>}
        {title}
      </div>
      {selected && (
        <button onClick={() => props.onCustomVisualizationClick(evalscriptUrl)} className="button-tertiary">
          Customize layer (show evalscript)
          <i className="fa fa-arrow-right visualization-layer-button-icon"></i>
        </button>
      )}
    </div>
  );
}

export default VisualizationLayer;
