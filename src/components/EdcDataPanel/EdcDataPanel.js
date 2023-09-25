import React, { useCallback, useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import moment from 'moment';

import { Tabs, Tab } from '../Tabs/Tabs';
import { PublicAndUserDataPanel } from './PublicAndUserDataPanel/PublicAndUserDataPanel';
import CommercialData from './CommercialDataPanel/CommercialData';
import store, { visualizationSlice, tabsSlice } from '../../store';
import { groupBy } from './EdcDataPanel.utils';
import { COLLECTION_TYPE, EDC_DATA_TAB, USER_DATA_TAB } from '../../const';
import { checkIfPublicDeploy } from '../../utils/envVarsUtils';
import './EdcDataPanel.scss';

function EdcDataPanel({
  collectionsList,
  selectedEdcDataTabIndex,
  selectedUserDataTabIndex,
  selectedGroup,
  showVisualisationPanel,
  publicCollectionsFilter,
  setPublicCollectionsFilter,
  userCollectionsFilter,
  setUserCollectionsFilter,
}) {
  const { selectedSubcategoryIndex } = useSelector((store) => store.tabs);
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

  useEffect(() => {
    if (selectedEdcDataTabIndex === EDC_DATA_TAB.PUBLIC && publicCollectionsFilter) {
      store.dispatch(tabsSlice.actions.setSelectedGroup(Object.keys(filteredPublicCollectionsByName)[0]));
    }

    if (selectedEdcDataTabIndex === EDC_DATA_TAB.USER && userCollectionsFilter) {
      store.dispatch(tabsSlice.actions.setSelectedGroup(Object.keys(filteredUserCollectionsByName)[0]));
    }
    // eslint-disable-next-line
  }, [publicCollectionsFilter, userCollectionsFilter, selectedEdcDataTabIndex]);

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
      if (selectedCollection.temporalExtent && selectedCollection.temporalExtent.interval) {
        let interval = selectedCollection.temporalExtent.interval;
        // some collections have more intervals, let's take the last (latest) one
        if (Array.isArray(interval[0])) {
          interval = interval[interval.length - 1];
        }

        let lastIntervalDate = interval[interval.length - 1];
        if (lastIntervalDate === null) {
          lastIntervalDate = moment.utc();
        }
        visualizationParams.fromTime = moment.utc(lastIntervalDate).subtract(1, 'year');
        visualizationParams.toTime = moment.utc(lastIntervalDate);
      }
      visualizationParams.type = selectedCollection.type;
      store.dispatch(visualizationSlice.actions.reset());
      store.dispatch(visualizationSlice.actions.setVisualizationParams(visualizationParams));
      showVisualisationPanel();
    }
  };

  const filterCollections = (collections, nameFilter) => {
    if (!nameFilter) {
      return collections;
    }

    const filteredCollections = {};

    for (let group in collections) {
      let newCollections;
      // check needed because subgroups of a collection group are saved as a property of array (e.g. arr['CMEMS'] = ['oceancolour1', 'oceancolour2', ...])
      const hasSubGroups = collections[group].length === 0 && Object.keys(collections[group]).length >= 1;

      if (hasSubGroups) {
        newCollections = [];
        for (let subgroup in collections[group]) {
          const newSubCollections = collections[group][subgroup].filter((col) =>
            col.title.toLowerCase().includes(nameFilter.toLowerCase()),
          );

          if (newSubCollections.length > 0) {
            newCollections[subgroup] = newSubCollections;
            filteredCollections[group] = newCollections;
          }
        }
      } else {
        newCollections = collections[group].filter((col) =>
          col.title.toLowerCase().includes(nameFilter.toLowerCase()),
        );

        if (newCollections.length > 0) {
          filteredCollections[group] = newCollections;
        }
      }
    }

    return filteredCollections;
  };

  const omitUserCollections = collectionsList.user.length === 0 || checkIfPublicDeploy();

  const filteredPublicCollectionsByName = filterCollections(publicCollections, publicCollectionsFilter);
  const filteredUserCollectionsByName = filterCollections(filteredUserCollections(), userCollectionsFilter);

  return (
    <div className="edc-data-panel">
      <Tabs
        activeIndex={selectedEdcDataTabIndex}
        onSelect={(index) => {
          store.dispatch(tabsSlice.actions.setEdcDataTabIndex(index));
        }}
      >
        <Tab title={`Public`} renderKey={EDC_DATA_TAB.PUBLIC}>
          <div className="filter-wrapper">
            <div className="filter-title">{`Filter collections:`}</div>
            <input
              className="filter-text-input"
              type="text"
              value={publicCollectionsFilter}
              onChange={(e) => setPublicCollectionsFilter(e.target.value)}
            />
          </div>
          <PublicAndUserDataPanel
            subcategoryIndex={selectedSubcategoryIndex}
            setSubcategory={(index) => store.dispatch(tabsSlice.actions.setSubcategoryIndex(index))}
            groups={filteredPublicCollectionsByName}
            handleCollectionClick={handleCollectionClick}
            selectedGroup={selectedGroup}
            setSelectedGroup={(group) => store.dispatch(tabsSlice.actions.setSelectedGroup(group))}
            shouldShowTooltip={true}
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
            <div className="filter-wrapper">
              <div className="filter-title">{`Filter collections:`}</div>
              <input
                className="filter-text-input"
                type="text"
                value={userCollectionsFilter}
                onChange={(e) => setUserCollectionsFilter(e.target.value)}
              />
            </div>
            <PublicAndUserDataPanel
              groups={filteredUserCollectionsByName}
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
