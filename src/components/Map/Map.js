import React, { useEffect, useRef } from 'react';
import { Map as LeafletMap, Pane, LayersControl, GeoJSON, FeatureGroup } from 'react-leaflet';
import { connect } from 'react-redux';
import L from 'leaflet';
import 'leaflet.pm';
import NProgress from 'nprogress';

import 'leaflet/dist/leaflet.css';
import 'leaflet.pm/dist/leaflet.pm.css';
import 'nprogress/nprogress.css';

import LeafletControls from './LeafletControls/LeafletControls';
import store, { mainMapSlice, aoiSlice, visualizationSlice, commercialDataSlice } from '../../store';
import GlTileLayer from './plugins/GlTileLayer';
import PreviewLayer from './PreviewLayer';
import { baseLayers, overlayTileLayers } from './Layers';
import { removeAoiWithEmptyCoords } from './Map.utils';
import VisualizationLayerComponent from './plugins/VisualizationLayerComponent';
import VectorDataLayer from './VectorDataLayer';
import { getCollectionInfo } from '../../utils/collections';

import './Map.scss';

import MaptilerLogo from '../../assets/icons/maptiler-logo-adaptive.svg';

const BASE_PANE_ID = 'baseMapPane';
const BASE_PANE_ZINDEX = 5;
const VISUALIZATION_LAYER_PANE_ID = 'viusalizationPane';
const VISUALIZATION_LAYER_PANE_ZINDEX = 6;

const { BaseLayer, Overlay } = LayersControl;

const previewAOIStyle = {
  color: 'green',
  fillColor: 'green',
  fillOpacity: 0.1,
};

const highlightedTileStyle = {
  weight: 2,
  color: '#57de71',
  opacity: 1,
  fillColor: '#57de71',
  fillOpacity: 0.3,
};

function Map(props) {
  const mapRef = useRef(null);
  const tooltipHolderRef = useRef(null);

  const {
    lat,
    lng,
    zoom,
    enabledOverlaysId,
    aoiGeometry,
    aoiLastEdited,
    previewAOI,
    collectionId,
    collectionsList,
    layerId,
    customVisualizationSelected,
    evalscript,
    evalscriptUrl,
    type,
    fromTime,
    toTime,
    dataGeometries,
    highlightedDataGeometry,
    selectedMainTabIndex,
    selectedEdcDataTabIndex,
    commercialDataDisplaySearchResults,
    commercialDataSearchResults,
    commercialDataHighlightedResult,
    commercialDataSelectedOrder,
  } = props;

  useEffect(() => {
    if (props.enableDrawing) {
      mapRef.current.leafletElement.pm.enableDraw('Poly', {
        finishOn: 'contextmenu',
        allowSelfIntersection: true,
      });
    } else {
      mapRef.current.leafletElement.pm.disableDraw('Poly');
      const AOILayerRef = getAOILayer();
      resetAoi(AOILayerRef, false);
    }
    // eslint-disable-next-line
  }, [props.enableDrawing]);

  useEffect(() => {
    mapRef.current.leafletElement.on('pm:create', (e) => {
      if (e.shape && e.shape === 'Polygon') {
        // e.layer.toGeoJSON() is a GeoJSON Feature, we convert it to a GeoJSON geometry type
        const geometry = e.layer.toGeoJSON().geometry;
        store.dispatch(aoiSlice.actions.set({ geometry: geometry, bounds: e.layer.getBounds() }));
        mapRef.current.leafletElement.removeLayer(e.layer);
        enableEdit();
      }
    });
    // eslint-disable-next-line
  }, []);

  function getAOILayer() {
    let AOILayerRef;
    mapRef.current.leafletElement.eachLayer((l) => {
      if (l.options.id && l.options.id === 'aoi-layer') {
        AOILayerRef = l;
        return;
      }
    });
    return AOILayerRef;
  }

  function enableEdit() {
    const AOILayerRef = getAOILayer();
    AOILayerRef.pm.enable();
    AOILayerRef.on('pm:edit', (f) => {
      const layer = f.target;
      const aoiGeojson = removeAoiWithEmptyCoords(layer.toGeoJSON());
      // in edit we can remove a vertex with a right click
      // when the 2nd last vertex is removed leaflet.pm will return an array with undefined
      // leaflet complains about this, and so we just simply remove the aoi.
      if (!aoiGeojson) {
        resetAoi(AOILayerRef);
        return;
      }
      // aoiGeojson is a GeoJSON FeatureCollection, we convert it to a GeoJSON geometry type
      const geometry = aoiGeojson.features[0].geometry;
      store.dispatch(aoiSlice.actions.set({ geometry: geometry, bounds: layer.getBounds() }));
      enableEdit();
    });
  }

  function resetAoi(AOILayerRef, removeFromStore = true) {
    mapRef.current.leafletElement.pm.disableDraw('Poly');
    if (AOILayerRef) {
      AOILayerRef.pm.disable();
    }
    if (removeFromStore) {
      store.dispatch(aoiSlice.actions.reset());
    }
    store.dispatch(mainMapSlice.actions.setEnableDrawing(false));
  }

  function updateViewport(viewport) {
    viewport.center = Object.values(L.latLng(...viewport.center).wrap());
    store.dispatch(mainMapSlice.actions.setViewport(viewport));
  }

  function setBounds(ev) {
    store.dispatch(
      mainMapSlice.actions.setBounds({
        bounds: ev.target.getBounds(),
        pixelBounds: ev.target.getPixelBounds(),
      }),
    );
  }

  function onUnload(tile) {
    const { tileId } = tile;
    store.dispatch(visualizationSlice.actions.removeTileDataGeometries(tileId));
  }

  const progress = NProgress.configure({
    parent: `#map`,
    showSpinner: false,
  });

  const collection = getCollectionInfo(collectionsList, collectionId, type, layerId);
  const canDisplayVisualizationLayer = !!(
    collection &&
    (layerId || (customVisualizationSelected && (evalscript || evalscriptUrl))) &&
    fromTime &&
    toTime
  );

  return (
    <>
      <LeafletMap
        ref={mapRef}
        minZoom={0}
        onViewportChanged={updateViewport}
        center={[lat, lng]}
        zoom={zoom}
        onMoveEnd={setBounds}
        whenReady={setBounds}
        zoomControl={false}
        attributionControl={false}
        scaleControl={false}
        fadeAnimation={false}
        id="map"
        onOverlayAdd={(ev) => {
          store.dispatch(mainMapSlice.actions.addOverlay(ev.layer.options.overlayTileLayerId));
        }}
        onOverlayRemove={(ev) => {
          store.dispatch(mainMapSlice.actions.removeOverlay(ev.layer.options.overlayTileLayerId));
        }}
      >
        <Pane name={BASE_PANE_ID} style={{ zIndex: BASE_PANE_ZINDEX }} />

        <LayersControl
          position="topright"
          sortLayers={true}
          sortFunction={(a, b) => {
            if (!mapRef.current) {
              return;
            }
            return (
              mapRef.current.leafletElement.getPane(a.options.pane).style.zIndex -
              mapRef.current.leafletElement.getPane(b.options.pane).style.zIndex
            );
          }}
        >
          {baseLayers.map((baseLayer) => (
            <BaseLayer checked={baseLayer.checked} name={baseLayer.name} key={baseLayer.name}>
              <GlTileLayer
                style={baseLayer.url}
                attribution={baseLayer.attribution}
                pane={BASE_PANE_ID}
                preserveDrawingBuffer={baseLayer.preserveDrawingBuffer}
              />
            </BaseLayer>
          ))}

          {overlayTileLayers().map((overlayTileLayer) => (
            <Overlay
              name={overlayTileLayer.name}
              key={`${overlayTileLayer.id}`}
              checked={enabledOverlaysId.includes(overlayTileLayer.id)}
            >
              <Pane name={overlayTileLayer.pane} style={{ zIndex: overlayTileLayer.zIndex }}>
                <GlTileLayer
                  style={overlayTileLayer.url}
                  attribution={overlayTileLayer.attribution}
                  overlayTileLayerId={overlayTileLayer.id}
                  pane={overlayTileLayer.pane}
                  preserveDrawingBuffer={overlayTileLayer.preserveDrawingBuffer}
                />
              </Pane>
            </Overlay>
          ))}

          <GeoJSON id="aoi-layer" data={aoiGeometry ? aoiGeometry : null} key={aoiLastEdited} />

          <GeoJSON
            id="preview-aoi-layer"
            data={previewAOI}
            key={JSON.stringify(previewAOI)}
            style={previewAOIStyle}
          />

          <Pane name={VISUALIZATION_LAYER_PANE_ID} style={{ zIndex: VISUALIZATION_LAYER_PANE_ZINDEX }} />

          {canDisplayVisualizationLayer && (
            <Overlay name={collection.id} checked={true}>
              <VisualizationLayerComponent
                layerId={layerId}
                customVisualizationSelected={customVisualizationSelected}
                evalscript={evalscript}
                evalscriptUrl={evalscriptUrl}
                collection={collection}
                fromTime={fromTime}
                toTime={toTime}
                pane={VISUALIZATION_LAYER_PANE_ID}
                onUnload={onUnload}
                progress={progress}
              />
            </Overlay>
          )}

          {dataGeometries.length > 0 && collection && (
            <VectorDataLayer
              data={dataGeometries}
              highlightedDataGeometry={highlightedDataGeometry}
              tooltipHolder={tooltipHolderRef.current}
            />
          )}
        </LayersControl>

        {commercialDataDisplaySearchResults &&
          !!commercialDataHighlightedResult &&
          selectedMainTabIndex === 1 && (
            <GeoJSON
              id="commercialDataResult"
              data={commercialDataHighlightedResult.geometry}
              key={commercialDataHighlightedResult.id}
              style={() => highlightedTileStyle}
            />
          )}

        {commercialDataDisplaySearchResults &&
        selectedMainTabIndex === 1 &&
        commercialDataSearchResults &&
        commercialDataSearchResults.length > 0 ? (
          <FeatureGroup
            onClick={(e) => {
              store.dispatch(
                commercialDataSlice.actions.setLocation({ lat: e.latlng.lat, lng: e.latlng.lng }),
              );
            }}
          >
            {commercialDataSearchResults.map((result, i) => (
              <PreviewLayer tile={result} key={`preview-layer-${i}`} />
            ))}
          </FeatureGroup>
        ) : null}

        {!collectionId &&
          !!commercialDataSelectedOrder &&
          !!commercialDataSelectedOrder.input &&
          !!commercialDataSelectedOrder.input.bounds &&
          !!commercialDataSelectedOrder.input.bounds.geometry &&
          selectedMainTabIndex === 1 &&
          selectedEdcDataTabIndex === 1 && (
            <GeoJSON
              id="commercialDataSelectedOrder"
              data={commercialDataSelectedOrder.input.bounds.geometry}
              key={commercialDataSelectedOrder.id}
              style={() => ({
                weight: 2,
                color: 'green',
                opacity: 1,
                fillColor: 'green',
                fillOpacity: 0.3,
              })}
            />
          )}

        <LeafletControls />

        <a href="https://www.maptiler.com/" target="_blank" rel="noopener noreferrer">
          <img className="maptiler-logo" src={MaptilerLogo} alt="" />
        </a>
      </LeafletMap>
      <div id="tooltip-holder" ref={tooltipHolderRef} />
    </>
  );
}

const mapStoreToProps = (store) => {
  return {
    lat: store.mainMap.lat,
    lng: store.mainMap.lng,
    zoom: store.mainMap.zoom,
    mapBounds: store.mainMap.bounds,
    enabledOverlaysId: store.mainMap.enabledOverlaysId,
    enableDrawing: store.mainMap.enableDrawing,
    aoiGeometry: store.aoi.geometry,
    aoiLastEdited: store.aoi.lastEdited,
    previewAOI: store.previewAOI.geometry,
    collectionId: store.visualization.collectionId,
    layerId: store.visualization.layerId,
    customVisualizationSelected: store.visualization.customVisualizationSelected,
    evalscript: store.visualization.evalscript,
    evalscriptUrl: store.visualization.evalscriptUrl,
    type: store.visualization.type,
    fromTime: store.visualization.fromTime,
    toTime: store.visualization.toTime,
    dataGeometries: store.visualization.dataGeometries,
    highlightedDataGeometry: store.visualization.highlightedDataGeometry,
    commercialDataSearchResults: store.commercialData.searchResults,
    commercialDataHighlightedResult: store.commercialData.highlightedResult,
    commercialDataDisplaySearchResults: store.commercialData.displaySearchResults,
    commercialDataSelectedOrder: store.commercialData.selectedOrder,
    selectedMainTabIndex: store.tabs.selectedMainTabIndex,
    selectedEdcDataTabIndex: store.tabs.selectedEdcDataTabIndex,
  };
};

export default connect(mapStoreToProps, null)(Map);
