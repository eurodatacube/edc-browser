import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import store, { visualizationSlice, mainMapSlice } from '../../store';
import { VisualizationTimeSelect } from '../DateSelectionComponents/VisualizationTimeSelect/VisualizationTimeSelect';
import { getServiceHandlerForCollectionType } from '../../services';
import VisualizationLayer from './VisualizationLayer';

import './VisualizationPanel.scss';

function VisualizationPanel(props) {
  const {
    configurations,
    selectedLayerId,
    selectedCollectionId,
    collectionName,
    collection,
    bestLocation,
    fromTime,
    toTime,
    mapBounds,
  } = props;

  useEffect(() => {
    if (!selectedLayerId && configurations.length > 0) {
      selectVisualizationLayer(configurations[0].layer_name);
    }
    // eslint-disable-next-line
  }, [selectedCollectionId]);

  function selectVisualizationLayer(layerId) {
    store.dispatch(visualizationSlice.actions.setVisualizationParams({ layerId: layerId }));
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
    return serviceHandler.getAvailableDates(collection, selectedLayerId, mapBounds, fromTime, toTime);
  }

  function goToBestLocation() {
    const { lat, lng } = bestLocation;
    if (lat && lng) {
      store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng }));
    }
  }

  const serviceHandler = getServiceHandlerForCollectionType(collection.type);
  const supportsDateSelection = serviceHandler.supportsDateSelection(collection.type);

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
        <div className="tools">
          {bestLocation && (
            <div className="zoom-to-location">
              <i className="fa fa-crosshairs" onClick={goToBestLocation} />
            </div>
          )}
        </div>
      )}
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
      </div>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  selectedLayerId: store.visualization.layerId,
  selectedCollectionId: store.visualization.collectionId,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  mapBounds: store.mainMap.bounds,
});

export default connect(mapStoreToProps, null)(VisualizationPanel);
