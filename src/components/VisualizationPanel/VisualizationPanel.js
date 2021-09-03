import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import store, { visualizationSlice, mainMapSlice } from '../../store';
import { VisualizationTimeSelect } from '../DateSelectionComponents/VisualizationTimeSelect/VisualizationTimeSelect';
import { getServiceHandlerForCollectionType } from '../../services';
import {
  generateReflectanceCompositeEvalscript,
  parseBandsFromEvalscript,
  generateIndexEvalscript,
} from '../../utils/evalscript';
import VisualizationLayer from './VisualizationLayer';
import EvalscriptEditor from '../EvalscriptEditor/EvalscriptEditor';

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
  } = props;

  const [showEvalscriptEditor, setShowEvalscriptEditor] = useState(
    !!(customVisualizationSelected && (evalscript || evalscriptUrl)),
  );

  useEffect(() => {
    if (!selectedLayerId && !customVisualizationSelected && configurations.length > 0) {
      selectVisualizationLayer(configurations[0].layer_name);
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

  function selectCustomVisualization() {
    const selectedBands = getDefaultSelectedBands();
    const evalscript = generateReflectanceCompositeEvalscript(selectedBands);
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        layerId: null,
        customVisualizationSelected: true,
        evalscript: evalscript,
      }),
    );
    setShowEvalscriptEditor(true);
  }

  function oncBackToCollectionList() {
    store.dispatch(visualizationSlice.actions.reset());
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

  const serviceHandler = getServiceHandlerForCollectionType(collection.type);
  const supportsDateSelection = serviceHandler.supportsDateSelection(collection.type);
  const supportsCustomScript = serviceHandler.supportsCustomScript(collection.type);

  const parsedBands = evalscript && parseBandsFromEvalscript(evalscript);
  const selectedBands = parsedBands || getDefaultSelectedBands();

  return (
    <div className="visualization-panel">
      <div className="header">
        <button className="back-button button-primary" onClick={oncBackToCollectionList}>
          <i className="fas fa-arrow-left" /> Back to list
        </button>
        <div className="collection-name">{collectionName}</div>
      </div>

      {supportsDateSelection && (
        <div className="date-selection">
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

      {bestLocation && (
        <div className="zoom-to-location button-secondary" onClick={goToBestLocation}>
          <i className="fa fa-crosshairs" onClick={goToBestLocation} />
          Zoom to data
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
          {configurations.map((configuration, i) => (
            <VisualizationLayer
              key={i}
              title={configuration.layer_name}
              evalscript={configuration.evalscript}
              evalscriptUrl={configuration.evalscript_url}
              selected={configuration.layer_name === selectedLayerId}
              onSelect={() => selectVisualizationLayer(configuration.layer_name)}
            />
          ))}
          {supportsCustomScript && (
            <div className={`visualization-layer ${customVisualizationSelected ? 'selected' : ''}`}>
              <div className="main-row">
                <div className="title" onClick={selectCustomVisualization}>
                  Custom Script
                </div>
              </div>
            </div>
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
});

export default connect(mapStoreToProps, null)(VisualizationPanel);
