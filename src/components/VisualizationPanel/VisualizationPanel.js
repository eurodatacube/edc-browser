import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import axios from 'axios';

import store, { visualizationSlice, mainMapSlice, paginationSlice } from '../../store';
import { VisualizationTimeSelect } from '../DateSelectionComponents/VisualizationTimeSelect/VisualizationTimeSelect';
import { getServiceHandlerForCollectionType } from '../../services';
import {
  generateReflectanceCompositeEvalscript,
  parseBandsFromEvalscript,
  generateIndexEvalscript,
} from '../../utils/evalscript';
import { getConfigValue } from '../../utils/configurations';
import VisualizationLayer from './VisualizationLayer';
import EvalscriptEditor, { CUSTOM_VISUALIZATION_URL_ROUTES } from '../EvalscriptEditor/EvalscriptEditor';
import { MAX_GEODB_FEATURES, COLLECTION_TYPE } from '../../const';

import './VisualizationPanel.scss';

function VisualizationPanel(props) {
  const {
    configurations,
    selectedLayerId,
    selectedCollectionId,
    customVisualizationSelected,
    evalscript,
    evalscriptUrl,
    collectionName,
    collection,
    bestLocation,
    fromTime,
    toTime,
    mapBounds,
    maxGeoDBFeatures,
    nFeaturesFetched,
    hasMore,
  } = props;

  const [showEvalscriptEditor, setShowEvalscriptEditor] = useState(
    !!(customVisualizationSelected && (evalscript || evalscriptUrl)),
  );

  useEffect(() => {
    if (!selectedLayerId && !customVisualizationSelected && configurations.length > 0) {
      const selectedLayer = getConfigValue(configurations[0], 'sentinelhub:layer_name', 'layer_name');
      selectVisualizationLayer(selectedLayer);
    } else if (configurations.length === 0 && supportsCustomScript) {
      selectCustomVisualization();
    }
    // eslint-disable-next-line
  }, [selectedCollectionId]);

  function selectVisualizationLayer(layerId) {
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        layerId: layerId,
        customVisualizationSelected: false,
        evalscript: null,
        evalscriptUrl: null,
      }),
    );
  }

  function getDefaultSelectedBands() {
    const bands = collection.bands;
    return [...bands, ...bands, ...bands].slice(0, 3);
  }

  function selectCustomVisualization(evalscript) {
    const selectedBands = getDefaultSelectedBands();
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        layerId: null,
        customVisualizationSelected: true,
        evalscript: evalscript ? evalscript : generateReflectanceCompositeEvalscript(selectedBands),
      }),
    );
    setShowEvalscriptEditor(true);
  }

  function oncBackToCollectionList() {
    if (collection && collection.type) {
      const serviceHandler = getServiceHandlerForCollectionType(collection.type);
      if (serviceHandler) {
        serviceHandler.reset();
      }
    }
    store.dispatch(visualizationSlice.actions.reset());
    store.dispatch(paginationSlice.actions.reset());
    props.onBack();
  }

  function onSelectedTimeChanged(fromTime, toTime) {
    store.dispatch(visualizationSlice.actions.setVisualizationParams({ fromTime: fromTime, toTime: toTime }));
  }

  function shouldExpandTimespan() {
    return !(
      fromTime.isSame(toTime, 'day') &&
      fromTime.isSame(fromTime.clone().startOf('day')) &&
      toTime.isSame(toTime.clone().endOf('day'))
    );
  }

  async function onQueryDates(toTime) {
    const fromTime = toTime.clone().subtract(1, 'month');
    return serviceHandler.getAvailableDates(collection, mapBounds, fromTime, toTime);
  }

  function goToBestLocation() {
    const { lat, lng, zoom } = bestLocation;
    if (lat && lng) {
      store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng, zoom: zoom }));
    }
  }

  function onBandsChange(bands) {
    const evalscript = generateReflectanceCompositeEvalscript(bands);
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        evalscript: evalscript,
      }),
    );
  }

  function onSetEvalscript({ evalscript, evalscripturl, isEvalUrl }) {
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        evalscript: isEvalUrl ? null : evalscript,
        evalscriptUrl: isEvalUrl ? evalscripturl : null,
      }),
    );
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        evalscript: evalscript,
      }),
    );
  }

  function onIndexScriptChange(bands, config) {
    const evalscript = generateIndexEvalscript(bands, config);
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        evalscript: evalscript,
      }),
    );
  }

  function onBackToLayerList() {
    setShowEvalscriptEditor(false);
    window.location.hash = '';
  }

  function loadMoreFeatures() {
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        maxGeoDBFeatures: maxGeoDBFeatures + MAX_GEODB_FEATURES,
      }),
    );
  }

  async function handleCustomVisualizationClick(evalscriptUrl) {
    const CODE_EDITOR_TAB = CUSTOM_VISUALIZATION_URL_ROUTES[2];
    window.location.hash = CODE_EDITOR_TAB;
    try {
      const response = await axios.get(evalscriptUrl);
      selectCustomVisualization(response.data);
    } catch {
      selectCustomVisualization();
    }
  }

  function renderVisualizationLayer(configuration, i) {
    const layerName = getConfigValue(configuration, 'sentinelhub:layer_name', 'layer_name');
    const evalscriptUrl = getConfigValue(configuration, 'evalscript_url', 'href');

    return (
      <VisualizationLayer
        onCustomVisualizationClick={handleCustomVisualizationClick}
        key={i}
        title={layerName}
        evalscript={configuration.evalscript}
        evalscriptUrl={evalscriptUrl}
        selected={layerName === selectedLayerId}
        onSelect={() => selectVisualizationLayer(layerName)}
      />
    );
  }

  const serviceHandler = getServiceHandlerForCollectionType(collection.type);
  const supportsDateSelection = serviceHandler.supportsDateSelection(collection.type);
  const supportsCustomScript =
    serviceHandler.supportsCustomScript(collection.type) && collection.bands.length > 0;
  const isGeoDB = collection.type === COLLECTION_TYPE.GEO_DB;

  let selectedBands;
  const parsedBands = parseBandsFromEvalscript(evalscript);
  if (Array.isArray(parsedBands)) {
    const areValidBands = parsedBands.every((band) => collection.bands.includes(band));
    selectedBands = areValidBands ? parsedBands : getDefaultSelectedBands();
  } else {
    selectedBands = getDefaultSelectedBands();
  }
  return (
    <div className="visualization-panel">
      <div className="panel-section">
        <div className="header">
          <button className="back-button" onClick={oncBackToCollectionList}>
            <i className="fas fa-arrow-left" />
          </button>
          <div className="collection-info">
            <div className="collection-name">{collectionName}</div>

            {bestLocation && (
              <button className="zoom-to-location button-tertiary" onClick={goToBestLocation}>
                <i className="fa fa-crosshairs" onClick={goToBestLocation} />
                Zoom to data
              </button>
            )}
          </div>
        </div>
      </div>
      {isGeoDB && (
        <div className="vector-features-panel">
          {hasMore && (
            <div className="maximum-feature-warning">
              Maximum features for a tile exceeded. Features will be loaded in batches.
            </div>
          )}

          <div className="load-more">
            Features fetched: <div className="n-features-fetched">{nFeaturesFetched}</div>
            {hasMore && (
              <button className="button-primary load-more-button" onClick={loadMoreFeatures}>
                Load more
              </button>
            )}
          </div>
        </div>
      )}

      {supportsDateSelection && (
        <div className="date-selection panel-section">
          <VisualizationTimeSelect
            fromTime={fromTime}
            toTime={toTime}
            minDate={moment().subtract(10, 'year')}
            maxDate={moment.utc()}
            updateSelectedTime={onSelectedTimeChanged}
            onQueryDatesForActiveMonth={onQueryDates}
            showNextPrev={true}
            timespanSupported={true}
            timespanExpanded={shouldExpandTimespan()}
          />
        </div>
      )}

      {showEvalscriptEditor && (
        <EvalscriptEditor
          allBands={collection.bands}
          selectedBands={selectedBands}
          evalscript={evalscript}
          evalscriptUrl={evalscriptUrl}
          onBack={onBackToLayerList}
          onChange={onBandsChange}
          onSetEvalscript={onSetEvalscript}
          onIndexScriptChange={onIndexScriptChange}
        />
      )}
      {!showEvalscriptEditor && (
        <div className="visualization-layers-wrapper">
          <div className="panel-section">
            {configurations.map((configuration, i) => renderVisualizationLayer(configuration, i))}
          </div>
          {supportsCustomScript && (
            <button
              className="button-secondary"
              onClick={(event, evalscript) => selectCustomVisualization(evalscript)}
            >
              Create custom visualization
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const mapStoreToProps = (store) => ({
  selectedLayerId: store.visualization.layerId,
  selectedCollectionId: store.visualization.collectionId,
  customVisualizationSelected: store.visualization.customVisualizationSelected,
  evalscript: store.visualization.evalscript,
  evalscriptUrl: store.visualization.evalscriptUrl,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  mapBounds: store.mainMap.bounds,
  maxGeoDBFeatures: store.visualization.maxGeoDBFeatures,
  hasMore: store.pagination.hasMore,
  nFeaturesFetched: store.pagination.nFetched,
});

export default connect(mapStoreToProps, null)(VisualizationPanel);
