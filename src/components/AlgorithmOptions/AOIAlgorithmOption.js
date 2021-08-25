import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { wktToGeoJSON, geojsonToWKT } from '@terraformer/wkt';
import booleanDisjoint from '@turf/boolean-disjoint';
import booleanEqual from '@turf/boolean-equal';

import L from 'leaflet';

import AOISelect from '../AOISelect/AOISelect';
import store, { aoiSlice, mainMapSlice, previewAOISlice } from '../../store';

function AOIAlgorithmOption(props) {
  const [displayAvailableArea, setDisplayAvailableArea] = useState(false);
  const { setAlgorithmParameter, id, restriction, value = null, aoiGeometryOnMap } = props;
  const geojson = value && wktToGeoJSON(value);

  function setAOIOption(geometry) {
    const geojson = wktToGeoJSON(restriction.value);
    const isValid = !booleanDisjoint(geometry, geojson);
    const wkt = geojsonToWKT(geometry);
    setAlgorithmParameter(id, wkt, isValid);
    store.dispatch(previewAOISlice.actions.reset());
    setDisplayAvailableArea(false);
  }

  function displayAOIOnMap() {
    const { lat, lng, bounds } = getBoundsAndLatLng(geojson);
    store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng }));
    store.dispatch(aoiSlice.actions.set({ geometry: geojson, bounds: bounds }));
  }

  function getBoundsAndLatLng(geometry) {
    const layer = L.geoJSON(geometry);
    const bounds = layer.getBounds();
    const { lat, lng } = bounds.getCenter();
    return { bounds: bounds, lat: lat, lng: lng };
  }

  function clearAOI() {
    if (booleanEqual(aoiGeometryOnMap, geojson)) {
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
  }, [displayAvailableArea, restriction.value]);

  return (
    <div className="algorithm-option-aoi">
      <div className="algorithm-option-aoi-restriction">
        <input
          type="checkbox"
          value={displayAvailableArea}
          onChange={() => setDisplayAvailableArea(!displayAvailableArea)}
          checked={displayAvailableArea}
        />
        <label> Display available area</label>
        {displayAvailableArea && (
          <i
            className="fa fa-crosshairs"
            title="Zoom to available area"
            onClick={zoomToRestrictionGeometry}
          ></i>
        )}
      </div>
      {value ? (
        <div className="algorithm-option-aoi-tools">
          <button className="button-primary algorithm-option-aoi-display" onClick={displayAOIOnMap}>
            Show
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
    </div>
  );
}

const mapStoreToProps = (store) => ({
  aoiGeometryOnMap: store.aoi.geometry,
});

export default connect(mapStoreToProps, null)(AOIAlgorithmOption);
