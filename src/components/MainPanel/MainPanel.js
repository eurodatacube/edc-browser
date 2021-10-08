import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { Tabs, Tab } from '../Tabs/Tabs';
import AlgorithmsPanel from '../AlgorithmsPanel/AlgorithmsPanel';
import EdcDataPanel from '../EdcDataPanel/EdcDataPanel';
import VisualizationPanel from '../VisualizationPanel/VisualizationPanel';
import { getServiceHandlerForCollectionType } from '../../services';
import store, { aoiSlice, tabsSlice, errorsSlice } from '../../store';
import { PANEL_TAB } from '../../const';
import { getCollectionInfo } from '../../utils/collections';
import ErrorPanel from '../ErrorPanel/ErrorPanel';

import edcLogo from './EDC_logo_square_white.svg';

import './MainPanel.scss';

function MainPanel(props) {
  const {
    selectedMainTabIndex,
    algorithmsList,
    algorithmsFetchingInProgress,
    collectionsList,
    selectedCollectionId,
    selectedLayerId,
    customVisualizationSelected,
    evalscript,
    evalscriptUrl,
    selectedType,
    aoiGeometry,
  } = props;

  const [panelOpen, setPanelOpen] = useState(true);
  const [showVisualizationPanel, setShowVisualizationPanel] = useState(
    !!(
      selectedCollectionId &&
      (selectedLayerId || (customVisualizationSelected && (evalscript || evalscriptUrl)))
    ),
  );
  const [configurations, setConfigurations] = useState(null);
  const [bestLocation, setBestLocation] = useState(null);

  const collection = getCollectionInfo(collectionsList, selectedCollectionId, selectedType, selectedLayerId);
  const TAB_TITLES = {
    [PANEL_TAB.ON_DEMAND_DATA_PANEL]: 'On demand data',
    [PANEL_TAB.DATA_PANEL]: 'EDC Data',
  };

  useEffect(() => {
    const getConfigurations = async (selectedCollectionId, selectedType, selectedLayerId) => {
      if (collection && collection.configurations) {
        setConfigurations(collection.configurations);
      } else {
        const serviceHandler = getServiceHandlerForCollectionType(collection.type);
        const configurations = await serviceHandler.getConfigurations(collection.group, collection.id);
        setConfigurations(configurations);
      }
    };
    if (selectedCollectionId) {
      getConfigurations(selectedCollectionId, selectedType, selectedLayerId);
    } else {
      setConfigurations(null);
    }
    // eslint-disable-next-line
  }, [selectedCollectionId, collectionsList]);

  useEffect(() => {
    const getBestLocation = async (selectedCollectionId, selectedType, selectedLayerId) => {
      if (collection) {
        const serviceHandler = getServiceHandlerForCollectionType(collection.type);
        try {
          const bestLocation = await serviceHandler.getBestInitialLocation(
            selectedCollectionId,
            selectedLayerId,
          );
          setBestLocation(bestLocation);
        } catch (error) {
          store.dispatch(
            errorsSlice.actions.addError({
              text: error.message,
            }),
          );
        }
      }
    };
    if (selectedCollectionId) {
      getBestLocation(selectedCollectionId, selectedType, selectedLayerId);
    } else {
      getBestLocation(null);
    }
    // eslint-disable-next-line
  }, [selectedCollectionId, collectionsList]);

  const confirmSwitchingTabs = (index) => {
    return window.confirm(
      `With switching to the ${
        PANEL_TAB.ON_DEMAND_DATA_PANEL === index
          ? TAB_TITLES[PANEL_TAB.ON_DEMAND_DATA_PANEL]
          : TAB_TITLES[PANEL_TAB.DATA_PANEL]
      } tab your area of interest (AOI) will be removed. Do you want to continue?`,
    );
  };

  return (
    <>
      <div className={`open-main-panel ${panelOpen ? 'hidden' : ''}`} onClick={() => setPanelOpen(true)}>
        <i className="fa fa-bars" />
      </div>

      <div className={`main-panel-wrapper ${panelOpen ? '' : 'hidden'}`}>
        <header id="header">
          <div className="header-left">
            <div className="close-main-panel" onClick={() => setPanelOpen(false)}>
              <i className="fa fa-chevron-left" />
            </div>
            <div className="app-title">
              <img className="app-logo" src={edcLogo} alt="Euro Data Cube" />
              <span>EDC Browser</span>
            </div>
          </div>
        </header>
        <ErrorPanel />
        <Tabs
          activeIndex={selectedMainTabIndex}
          onSelect={(index) => {
            if (aoiGeometry) {
              if (confirmSwitchingTabs(index)) {
                store.dispatch(aoiSlice.actions.reset());
              } else {
                return;
              }
            }
            store.dispatch(tabsSlice.actions.setMainTabIndex(index));
          }}
        >
          <Tab id="edc-data-tab" title={TAB_TITLES[PANEL_TAB.DATA_PANEL]} renderKey={PANEL_TAB.DATA_PANEL}>
            <div className="panel-wrapper">
              {showVisualizationPanel && configurations ? (
                <VisualizationPanel
                  configurations={configurations}
                  collectionName={collection.title}
                  collection={collection}
                  bestLocation={bestLocation}
                  onBack={() => setShowVisualizationPanel(false)}
                />
              ) : (
                <EdcDataPanel
                  collectionsList={collectionsList}
                  showVisualisationPanel={() => setShowVisualizationPanel(true)}
                />
              )}
            </div>
          </Tab>
          <Tab
            id="algorithms-tab"
            title={TAB_TITLES[PANEL_TAB.ON_DEMAND_DATA_PANEL]}
            renderKey={PANEL_TAB.ON_DEMAND_DATA_PANEL}
          >
            <div className="panel-wrapper">
              <AlgorithmsPanel
                algorithmsList={algorithmsList}
                fetchingInProgress={algorithmsFetchingInProgress}
              />
            </div>
          </Tab>
        </Tabs>
      </div>
    </>
  );
}

const mapStoreToProps = (store) => ({
  selectedMainTabIndex: store.tabs.selectedMainTabIndex,
  selectedCollectionId: store.visualization.collectionId,
  selectedLayerId: store.visualization.layerId,
  customVisualizationSelected: store.visualization.customVisualizationSelected,
  evalscript: store.visualization.evalscript,
  evalscriptUrl: store.visualization.evalscriptUrl,
  selectedType: store.visualization.type,
  aoiGeometry: store.aoi.geometry,
});

export default connect(mapStoreToProps, null)(MainPanel);
