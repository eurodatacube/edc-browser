import React, { useState } from 'react';
import Accordion from '../../Accordion/Accordion';

import './PublicAndUserDataPanel.scss';

export const PublicAndUserDataPanel = ({ groups, handleCollectionClick }) => {
  const [selectedAccordion, setSelectedAccordion] = useState(null);

  const toggleAccordion = (index) => {
    if (index !== selectedAccordion) {
      setSelectedAccordion(index);
    } else {
      setSelectedAccordion(null);
    }
  };

  return (
    <div>
      {Object.keys(groups).map((groupKey) => {
        return (
          <Accordion
            open={selectedAccordion === groupKey}
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
