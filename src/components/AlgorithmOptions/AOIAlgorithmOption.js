import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { wktToGeoJSON, geojsonToWKT } from '@terraformer/wkt';
import booleanDisjoint from '@turf/boolean-disjoint';
import booleanEqual from '@turf/boolean-equal';

import L from 'leaflet';

import AOISelect from '../AOISelect/AOISelect';
import store, { aoiSlice, mainMapSlice, previewAOISlice } from '../../store';
import { getBoundsAndLatLng } from '../EdcDataPanel/CommercialDataPanel/commercialData.utils';
import Switch from '../shared/Switch/Switch';

function AOIAlgorithmOption(props) {
  const [displayAvailableArea, setDisplayAvailableArea] = useState(false);

  const {
    setAlgorithmParameter,
    id,
    restriction,
    value = null,
    aoiGeometryOnMap,
    aoiDrawingEnabled,
    renderError,
    showingError,
    isValid,
    isOptional,
  } = props;
  const geojson = value && wktToGeoJSON(value);

  function setAOIOption(geometry) {
    let isValid = true;
    if (restriction && restriction.value) {
      const geojson = wktToGeoJSON(restriction.value);
      isValid = !booleanDisjoint(geometry, geojson);
    }
    const wkt = geojsonToWKT(geometry);
    setAlgorithmParameter(id, wkt, isValid);
    store.dispatch(previewAOISlice.actions.reset());
    setDisplayAvailableArea(false);
  }

  function displayAOIOnMap() {
    const { lat, lng, zoom } = getBoundsAndLatLng(geojson);
    const bounds = L.geoJSON(geojson).getBounds();
    store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng, zoom: zoom }));
    store.dispatch(aoiSlice.actions.set({ geometry: geojson, bounds: bounds }));
  }

  function clearAOI() {
    if (aoiGeometryOnMap && geojson && booleanEqual(aoiGeometryOnMap, geojson)) {
      store.dispatch(aoiSlice.actions.reset());
    }
    store.dispatch(previewAOISlice.actions.reset());
    setAlgorithmParameter(id, null, false);
    setDisplayAvailableArea(false);
  }

  function zoomToRestrictionGeometry() {
    const geojson = wktToGeoJSON(restriction.value);
    const { lat, lng } = getBoundsAndLatLng(geojson);
    store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng }));
  }

  useEffect(() => {
    if (displayAvailableArea) {
      const geojson = wktToGeoJSON(restriction.value);
      store.dispatch(previewAOISlice.actions.set(geojson));
    } else {
      store.dispatch(previewAOISlice.actions.reset());
    }
    // eslint-disable-next-line
  }, [displayAvailableArea, restriction && restriction.value]);

  const canDisplayAvailableArea = restriction && restriction.value;

  return (
    <div className="algorithm-option-aoi">
      <div className="algorithm-option-aoi-restriction">
        {canDisplayAvailableArea && (
          <>
            <Switch
              checked={displayAvailableArea}
              value={displayAvailableArea}
              onChange={() => setDisplayAvailableArea(!displayAvailableArea)}
              label="Display available area"
            />
          </>
        )}
        {displayAvailableArea && (
          <div>
            <button onClick={zoomToRestrictionGeometry} className="button-tertiary">
              <i className="fa fa-crosshairs" title="Zoom to available area"></i>
              Zoom to available area
            </button>
          </div>
        )}
      </div>
      {value && aoiGeometryOnMap && !aoiDrawingEnabled ? (
        <div className="algorithm-option-aoi-tools">
          <button className="button-primary algorithm-option-aoi-display" onClick={displayAOIOnMap}>
            Zoom to AOI
          </button>
          <button className="button-tertiary algorithm-option-aoi-clear" onClick={clearAOI}>
            Clear
          </button>
        </div>
      ) : (
        <>
          <AOISelect geometry={geojson} onFinished={setAOIOption} />
        </>
      )}
      {showingError &&
        renderError(
          value,
          isValid,
          isOptional,
          'Area of interest has to be selected.',
          'Area of interest is out of restriction bounds.',
        )}
    </div>
  );
}

const mapStoreToProps = (store) => ({
  aoiGeometryOnMap: store.aoi.geometry,
  aoiDrawingEnabled: store.aoi.drawingEnabled,
});

export default connect(mapStoreToProps, null)(AOIAlgorithmOption);
