import React, { useState } from 'react';
import L from 'leaflet';
import { connect } from 'react-redux';

import store, { aoiSlice, mainMapSlice } from '../../store';
import { getFileExtension, loadFile, parseFile } from './AOISelect.utils';
import { SUPPORTED_AOI_FORMATS } from '../../const';

import './AOISelect.scss';

function AOISelect(props) {
  const [error, setError] = useState(null);
  const [drawingInProgress, setDrawingInProgress] = useState(false);
  const { drawnGeometry, drawingOnMapEnabled, geometry, onFinished } = props;

  async function onFileUpload(e) {
    const file = e.target.files[0];
    const format = getFileExtension(file.name);

    if (!SUPPORTED_AOI_FORMATS.includes(format)) {
      setError(`Format "${format}" not supported! Supported formats: ${SUPPORTED_AOI_FORMATS.join(', ')}.`);
      return;
    }

    try {
      const loadedFile = await loadFile(file, format);
      const geometry = parseFile(loadedFile, format);
      const layer = L.geoJSON(geometry);
      const bounds = layer.getBounds();
      onFinished(geometry);
      store.dispatch(aoiSlice.actions.set({ geometry: geometry, bounds: bounds }));
      const { lat, lng } = bounds.getCenter();
      store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng }));
      setError(null);
    } catch (err) {
      setError(err.message ? err.message : err);
    }
  }

  function finishDrawing() {
    if (drawnGeometry) {
      store.dispatch(mainMapSlice.actions.setEnableDrawing(false));
      onFinished(drawnGeometry);
    }
  }

  if (geometry || drawingInProgress) {
    return (
      <div className="aoi-confirm-panel">
        <button
          disabled={!drawnGeometry}
          className={`button-primary continue-button`}
          onClick={finishDrawing}
        >
          Continue
        </button>
        <button
          className="button-icon clear-aoi-button"
          onClick={() => {
            store.dispatch(aoiSlice.actions.reset());
            store.dispatch(mainMapSlice.actions.setEnableDrawing(false));
            setDrawingInProgress(false);
          }}
        >
          <i className="fas fa-times" />
        </button>
      </div>
    );
  }

  const disabled = drawingOnMapEnabled && !drawingInProgress; // Some other AOI Select component is drawing

  return (
    <div className="aoi-select-panel">
      <button
        className={`button-primary ${disabled ? 'disabled' : ''}`}
        onClick={() => {
          if (disabled) {
            return;
          }
          setDrawingInProgress(true);
          store.dispatch(aoiSlice.actions.reset());
          store.dispatch(mainMapSlice.actions.setEnableDrawing(true));
        }}
      >
        Select area of interest
      </button>
      <button className={`button-secondary upload-aoi-button ${disabled ? 'disabled' : ''}`}>
        <label htmlFor="upload-aoi" className="upload-label">
          Upload GeoJSON/KML/KMZ/GPX
        </label>
        <input
          id="upload-aoi"
          type="file"
          onChange={(e) => {
            if (disabled) {
              return;
            }
            onFileUpload(e);
          }}
          accept=".kml, .kmz, .gpx, .geojson"
        />
      </button>
      {error && <div className="error-panel">{error}</div>}
    </div>
  );
}

const mapStoreToProps = (store) => {
  return {
    drawnGeometry: store.aoi.geometry,
    drawingOnMapEnabled: store.mainMap.enableDrawing,
  };
};

export default connect(mapStoreToProps, null)(AOISelect);
