import React, { useState } from 'react';
import geo_area from '@mapbox/geojson-area';
import L from 'leaflet';
import store, { aoiSlice, mainMapSlice } from '../../../../store';
import { UploadGeoFile } from '../../../junk/UploadGeoFile/UploadGeoFile';
import { AOI_SHAPE } from '../../../../const';

export const AOISelection = ({ aoiGeometry, aoiDrawingEnabled, mapBounds }) => {
  const [uploadDialog, setUploadDialog] = useState(false);

  const onFileUpload = (geometry) => {
    const layer = L.geoJSON(geometry);
    store.dispatch(aoiSlice.actions.setShape(AOI_SHAPE.polygon));
    store.dispatch(aoiSlice.actions.set({ geometry, bounds: layer.getBounds() }));
    setUploadDialog(false);
    const { lat, lng } = layer.getBounds().getCenter();
    store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng }));
    store.dispatch(aoiSlice.actions.setDrawingEnabled(false));
  };

  const setCurrentDisplayArea = () => {
    if (mapBounds) {
      const geometry = {
        type: 'Polygon',
        coordinates: [
          [
            [mapBounds._southWest.lng, mapBounds._southWest.lat],
            [mapBounds._northEast.lng, mapBounds._southWest.lat],
            [mapBounds._northEast.lng, mapBounds._northEast.lat],
            [mapBounds._southWest.lng, mapBounds._northEast.lat],
            [mapBounds._southWest.lng, mapBounds._southWest.lat],
          ],
        ],
      };
      store.dispatch(aoiSlice.actions.set({ geometry: geometry, bounds: mapBounds }));
    }
  };

  const clearAOI = () => {
    store.dispatch(aoiSlice.actions.reset());
  };

  return (
    <div className="row">
      <label title="Area of interest">{`Area of interest`}</label>
      <div className="aoi-selection">
        <div className="aoi-text">
          {!!aoiGeometry ? (
            <span className="area-text">
              {(parseFloat(geo_area.geometry(aoiGeometry)) / 1000000).toFixed(2)} {`km`}
              <sup>2</sup>
            </span>
          ) : (
            <span>Select area</span>
          )}
        </div>
        <div className="aoi-buttons">
          {!aoiGeometry && !aoiDrawingEnabled && (
            <>
              <i
                className="fa fa-television"
                title={`Use current display area`}
                onClick={() => setCurrentDisplayArea()}
              />

              <i className="fa fa-upload" title={`Upload data`} onClick={() => setUploadDialog(true)} />

              <i
                className="far fa-square"
                title={`Draw rectangular area of interest`}
                onClick={() => {
                  store.dispatch(aoiSlice.actions.setShape(AOI_SHAPE.rectangle));
                  store.dispatch(aoiSlice.actions.setDrawingEnabled(true));
                }}
              />

              <i
                className="fa fa-pencil"
                title={`Draw polygonal area of interest`}
                onClick={() => {
                  store.dispatch(aoiSlice.actions.setShape(AOI_SHAPE.polygon));
                  store.dispatch(aoiSlice.actions.setDrawingEnabled(true));
                }}
              />
            </>
          )}

          {(!!aoiGeometry || aoiDrawingEnabled) && (
            <i className="fa fa-close" title={`Cancel`} onClick={clearAOI} />
          )}

          {uploadDialog && <UploadGeoFile onUpload={onFileUpload} onClose={() => setUploadDialog(false)} />}
        </div>
      </div>
    </div>
  );
};
