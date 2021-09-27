import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import { Tabs, Tab } from '../Tabs/Tabs';
import { PublicAndUserDataPanel } from './PublicAndUserDataPanel/PublicAndUserDataPanel';
import CommercialData from './CommercialDataPanel/CommercialData';
import store, { visualizationSlice, tabsSlice } from '../../store';
import { groupBy } from './EdcDataPanel.utils';
import { COLLECTION_TYPE, EDC_DATA_TAB, USER_DATA_TAB } from '../../const';

import './EdcDataPanel.scss';

function EdcDataPanel({
  collectionsList,
  selectedEdcDataTabIndex,
  selectedUserDataTabIndex,
  selectedGroup,
  showVisualisationPanel,
}) {
  const publicCollections = groupBy(collectionsList.public, 'group');

  const filteredUserCollections = useCallback(() => {
    if (selectedUserDataTabIndex === USER_DATA_TAB.SHARED) {
      return groupBy(
        collectionsList.user.filter((collection) => !collection.ownedByUser),
        'group',
      );
    }
    return groupBy(
      collectionsList.user.filter((collection) => collection.ownedByUser),
      'group',
    );
  }, [collectionsList.user, selectedUserDataTabIndex]);

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
        <Tab title={`Public`} renderKey={EDC_DATA_TAB.PUBLIC}>
          <PublicAndUserDataPanel
            groups={publicCollections}
            handleCollectionClick={handleCollectionClick}
            selectedGroup={selectedGroup}
            setSelectedGroup={(group) => store.dispatch(tabsSlice.actions.setSelectedGroup(group))}
          />
        </Tab>
        <Tab title={`Commercial`} renderKey={EDC_DATA_TAB.COMMERCIAL}>
          <CommercialData collectionsList={collectionsList} />
        </Tab>
        <Tab title={`User`} renderKey={EDC_DATA_TAB.USER} omit={omitUserCollections}>
          <>
            <div className="toggle">
              <div
                className={`button ${selectedUserDataTabIndex === USER_DATA_TAB.SHARED ? 'selected' : ''}`}
                onClick={() => store.dispatch(tabsSlice.actions.setUserDataTabIndex(USER_DATA_TAB.SHARED))}
              >
                Shared
              </div>
              <div
                className={`button ${selectedUserDataTabIndex === USER_DATA_TAB.PRIVATE ? 'selected' : ''}`}
                onClick={() => store.dispatch(tabsSlice.actions.setUserDataTabIndex(USER_DATA_TAB.PRIVATE))}
              >
                Private
              </div>
            </div>
            <PublicAndUserDataPanel
              groups={filteredUserCollections()}
              handleCollectionClick={handleCollectionClick}
              selectedGroup={selectedGroup}
              setSelectedGroup={(group) => store.dispatch(tabsSlice.actions.setSelectedGroup(group))}
            />
          </>
        </Tab>
      </Tabs>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  selectedEdcDataTabIndex: store.tabs.selectedEdcDataTabIndex,
  selectedUserDataTabIndex: store.tabs.selectedUserDataTabIndex,
  selectedGroup: store.tabs.selectedGroup,
});

export default connect(mapStoreToProps, null)(EdcDataPanel);
