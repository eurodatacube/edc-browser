import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';

import { Tabs, Tab } from '../Tabs/Tabs';
import GroupedSelection from './GroupedSelection';
import CommercialData from './CommercialDataPanel/CommercialData';
import store, { visualizationSlice, tabsSlice } from '../../store';
import { groupBy } from './EdcDataPanel.utils';
import { COLLECTION_TYPE } from '../../const';

import './EdcDataPanel.scss';

function EdcDataPanel({ collectionsList, selectedEdcDataTabIndex, showVisualisationPanel }) {
  const [displayAll, setDisplayAll] = useState(true);

  const publicCollections = groupBy(collectionsList.public, 'group');

  const filteredUserCollections = useCallback(() => {
    if (displayAll) {
      return groupBy(
        collectionsList.user.filter((collection) => !collection.ownedByUser),
        'group',
      );
    }
    return groupBy(
      collectionsList.user.filter((collection) => collection.ownedByUser),
      'group',
    );
  }, [collectionsList.user, displayAll]);

  const selectionChange = (selectedCollection) => {
    if (selectedCollection) {
      let visualizationParams;
      if (selectedCollection.type === COLLECTION_TYPE.GEO_DB) {
        visualizationParams = {
          collectionId: selectedCollection.group,
          layerId: selectedCollection.id,
        };
      } else {
        visualizationParams = {
          collectionId: selectedCollection.id,
        };
      }
      visualizationParams.type = selectedCollection.type;
      store.dispatch(visualizationSlice.actions.setVisualizationParams(visualizationParams));
      showVisualisationPanel();
    }
  };

  return (
    <div className="edc-data-panel panel-content-wrap">
      <Tabs
        activeIndex={selectedEdcDataTabIndex}
        onSelect={(index) => store.dispatch(tabsSlice.actions.setEdcDataTabIndex(index))}
      >
        <Tab title={`Public`} renderKey={0}>
          <GroupedSelection group={publicCollections} onSelectionChange={selectionChange} />
        </Tab>
        <Tab title={`Commercial`} renderKey={1}>
          <CommercialData collectionsList={collectionsList} />
        </Tab>
        <Tab title={`User`} renderKey={2}>
          <>
            <div className="toggle">
              <div className={`button ${displayAll ? 'selected' : ''}`} onClick={() => setDisplayAll(true)}>
                Shared
              </div>
              <div className={`button ${displayAll ? '' : 'selected'}`} onClick={() => setDisplayAll(false)}>
                Private
              </div>
            </div>
            <GroupedSelection group={filteredUserCollections()} onSelectionChange={selectionChange} />
          </>
        </Tab>
      </Tabs>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  selectedEdcDataTabIndex: store.tabs.selectedEdcDataTabIndex,
});

export default connect(mapStoreToProps, null)(EdcDataPanel);
