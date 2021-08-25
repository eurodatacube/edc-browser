import React, { useState } from 'react';

import './GroupedSelection.scss';

function GroupedSelection({ group, onSelectionChange }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedDisplayedGroups, setDisplayedGroups] = useState(
    Array.from({ length: Object.keys(group).length }).fill(false, 0),
  );
  const [selectedCollections, setSelectedCollections] = useState(null);

  const headerClickHandler = (groupKey, groupIndex) => {
    setDisplayedGroups((prevState) => {
      const newSelection = Array.from(prevState).fill(false, 0);
      newSelection[groupIndex] = !prevState[groupIndex];
      return newSelection;
    });

    if (groupKey && groupKey !== selectedGroup) {
      // clear selected collections on changing group
      setSelectedCollectionsHandler([]);
    }
    setSelectedGroup(groupKey);
  };

  const onChangeHandler = (e) => {
    const { id, group, type } = e;
    setSelectedCollectionsHandler({ id: id, group: group, type: type });
  };

  const setSelectedCollectionsHandler = (selected) => {
    setSelectedCollections(selected.id);
    onSelectionChange(selected);
  };

  const stopPropagation = (evt) => {
    evt.stopPropagation();
  };

  return Object.keys(group).map((groupKey, groupIndex) => {
    const groupVisibility = selectedDisplayedGroups[groupIndex] && selectedGroup === groupKey;
    return (
      <div
        className="group-selection"
        key={groupKey}
        onClick={() => headerClickHandler(groupKey, groupIndex)}
      >
        <div className="group-header">
          <div className="group-title">{groupKey}</div>

          <span className={`${groupVisibility ? 'icon open' : 'icon closed'}`}>
            <i className={`fa fa-angle-down`} />
          </span>
        </div>
        {groupVisibility ? (
          <div className="selections">
            {group[groupKey].map((collection) => (
              <div className="selection-item" key={collection.uniqueId} onClick={stopPropagation}>
                <input
                  id={collection.uniqueId}
                  type="checkbox"
                  value={collection.id}
                  onChange={() => onChangeHandler(collection)}
                  checked={selectedCollections === collection.id}
                />
                <label htmlFor={collection.uniqueId}>{collection.id}</label>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  });
}

export default GroupedSelection;
