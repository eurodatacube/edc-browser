import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';

import { Tabs, Tab } from '../Tabs/Tabs';
import { PublicAndUserDataPanel } from './PublicAndUserDataPanel/PublicAndUserDataPanel';
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

  const handleCollectionClick = (selectedCollection) => {
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

  const omitUserCollections =
    collectionsList.user.length === 0 || process.env.REACT_APP_PUBLIC_DEPLOY === 'true';

  return (
    <div className="edc-data-panel panel-content-wrap">
      <Tabs
        activeIndex={selectedEdcDataTabIndex}
        onSelect={(index) => store.dispatch(tabsSlice.actions.setEdcDataTabIndex(index))}
      >
        <Tab title={`Public`} renderKey={0}>
          <PublicAndUserDataPanel groups={publicCollections} handleCollectionClick={handleCollectionClick} />
        </Tab>
        <Tab title={`Commercial`} renderKey={1}>
          <CommercialData collectionsList={collectionsList} />
        </Tab>
        <Tab title={`User`} renderKey={2} omit={omitUserCollections}>
          <>
            <div className="toggle">
              <div className={`button ${displayAll ? 'selected' : ''}`} onClick={() => setDisplayAll(true)}>
                Shared
              </div>
              <div className={`button ${displayAll ? '' : 'selected'}`} onClick={() => setDisplayAll(false)}>
                Private
              </div>
            </div>
            <PublicAndUserDataPanel
              groups={filteredUserCollections()}
              handleCollectionClick={handleCollectionClick}
            />
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
