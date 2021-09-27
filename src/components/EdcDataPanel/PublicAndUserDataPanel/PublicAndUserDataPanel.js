import React from 'react';
import Accordion from '../../Accordion/Accordion';

import './PublicAndUserDataPanel.scss';

export const PublicAndUserDataPanel = ({
  groups,
  handleCollectionClick,
  selectedGroup,
  setSelectedGroup,
}) => {
  const toggleAccordion = (index) => {
    if (index !== selectedGroup) {
      setSelectedGroup(index);
    } else {
      setSelectedGroup(null);
    }
  };

  return (
    <div>
      {Object.keys(groups).map((groupKey) => {
        return (
          <Accordion
            open={selectedGroup === groupKey}
            title={groupKey}
            key={groupKey}
            toggleOpen={() => toggleAccordion(groupKey)}
          >
            {groups[groupKey].map((collection) => {
              return (
                <div
                  className="selection-item"
                  key={collection.uniqueId}
                  onClick={(evt) => {
                    evt.stopPropagation();
                    handleCollectionClick(collection);
                  }}
                >
                  {collection.title}
                  <i className="fas fa-chevron-right"></i>
                </div>
              );
            })}
          </Accordion>
        );
      })}
    </div>
  );
};
