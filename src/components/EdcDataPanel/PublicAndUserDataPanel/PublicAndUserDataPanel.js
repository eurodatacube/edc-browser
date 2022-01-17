import React from 'react';
import Accordion from '../../Accordion/Accordion';

import './PublicAndUserDataPanel.scss';

export const PublicAndUserDataPanel = ({
  groups,
  handleCollectionClick,
  selectedGroup,
  setSelectedGroup,
  setSubcategory,
  subcategoryIndex,
}) => {
  const toggleAccordion = (index) => {
    if (index !== selectedGroup) {
      setSelectedGroup(index);
    } else {
      setSelectedGroup(null);
    }
  };

  function onSubcategoryClick(index) {
    if (index === subcategoryIndex) {
      setSubcategory(-1);
    } else {
      setSubcategory(index);
    }
  }

  return (
    <div>
      {Object.keys(groups).map((groupKey) => {
        if (groupKey === 'Copernicus services') {
          return (
            <Accordion
              open={selectedGroup === groupKey}
              title={groupKey}
              key={groupKey}
              toggleOpen={() => toggleAccordion(groupKey)}
            >
              <div className="selection-items">
                <div className="accordion-subcategory">
                  {Object.keys(groups[groupKey]).map((key, index) => {
                    return (
                      <Accordion
                        toggleOpen={() => onSubcategoryClick(index)}
                        open={subcategoryIndex === index}
                        title={key}
                      >
                        <div className="selection-items">
                          {groups[groupKey][key].map((item) => {
                            return (
                              <div
                                key={item.uniqueId}
                                onClick={(evt) => {
                                  evt.stopPropagation();
                                  handleCollectionClick(item);
                                }}
                                className="selection-item"
                              >
                                {item.title}
                              </div>
                            );
                          })}
                        </div>
                      </Accordion>
                    );
                  })}
                </div>
              </div>
            </Accordion>
          );
        }
        return (
          <Accordion
            open={selectedGroup === groupKey}
            title={groupKey}
            key={groupKey}
            toggleOpen={() => toggleAccordion(groupKey)}
          >
            <div className="selection-items">
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
            </div>
          </Accordion>
        );
      })}
    </div>
  );
};
