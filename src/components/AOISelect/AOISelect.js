import React, { useState } from 'react';
import L from 'leaflet';
import { connect } from 'react-redux';

import store, { aoiSlice, mainMapSlice } from '../../store';
import { getFileExtension, loadFile, parseFile } from './AOISelect.utils';
import { AOI_SHAPE, SUPPORTED_AOI_FORMATS } from '../../const';

import './AOISelect.scss';

function AOISelect(props) {
  const [error, setError] = useState(null);
  const [drawingInProgress, setDrawingInProgress] = useState(false);
  const { drawnGeometry, aoiShape, aoiDrawingEnabled, onFinished } = props;

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

  function startDrawing() {
    setDrawingInProgress(true);
    store.dispatch(aoiSlice.actions.reset());
    store.dispatch(aoiSlice.actions.setDrawingEnabled(true));
  }

  function clearDrawing() {
    setDrawingInProgress(false);
    store.dispatch(aoiSlice.actions.reset());
  }

  function finishDrawing() {
    if (drawnGeometry) {
      store.dispatch(aoiSlice.actions.setDrawingEnabled(false));
      onFinished(drawnGeometry);
    }
  }

  function changeShape(shape) {
    store.dispatch(aoiSlice.actions.setShape(shape));
  }

  if (drawingInProgress && aoiDrawingEnabled) {
    return (
      <div className="aoi-confirm-panel">
        {!drawnGeometry && (
          <>
            <button
              className={'button-primary' + (aoiShape === AOI_SHAPE.rectangle ? '' : ' inactive')}
              onClick={() => {
                changeShape(AOI_SHAPE.rectangle);
              }}
            >
              <i className="far fa-square" title={`Draw area of interest`} />
              <span>{AOI_SHAPE.rectangle}</span>
            </button>
            <button
              className={'button-primary' + (aoiShape === AOI_SHAPE.polygon ? '' : ' inactive')}
              onClick={() => {
                changeShape(AOI_SHAPE.polygon);
              }}
            >
              <i className="fa fa-pencil" title={`Draw area of interest`} />
              <span>{AOI_SHAPE.polygon}</span>
            </button>
          </>
        )}
        {drawnGeometry && (
          <button
            disabled={!drawnGeometry}
            className={`button-primary continue-button`}
            onClick={finishDrawing}
          >
            Continue
          </button>
        )}
        <button className="button-icon clear-aoi-button" onClick={clearDrawing}>
          <i className="fas fa-times" />
        </button>
      </div>
    );
  }

  const disabled = aoiDrawingEnabled && !drawingInProgress; // Some other AOI Select component is drawing

  return (
    <div className="aoi-select-panel">
      <button
        className={`button-primary ${disabled ? 'disabled' : ''}`}
        onClick={() => {
          if (disabled) {
            return;
          }
          startDrawing();
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
    aoiShape: store.aoi.shape,
    aoiDrawingEnabled: store.aoi.drawingEnabled,
  };
};

export default connect(mapStoreToProps, null)(AOISelect);
