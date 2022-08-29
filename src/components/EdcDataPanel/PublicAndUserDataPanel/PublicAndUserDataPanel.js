import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import Accordion from '../../Accordion/Accordion';
import InfoTooltip from '../../InfoTooltip/InfoTooltip';

import './PublicAndUserDataPanel.scss';
import { MAX_DESCRIPTION_LENGTH_IN_CHARS } from '../../../const';

export const PublicAndUserDataPanel = ({
  groups,
  handleCollectionClick,
  selectedGroup,
  setSelectedGroup,
  setSubcategory,
  subcategoryIndex,
  shouldShowTooltip,
}) => {
  const [openTooltipId, setOpenTooltipId] = useState('');

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

  const getMarkdownForCollection = (collection) => {
    const description = collection?.description;
    const link = collection?.extendedInformationLink;

    if (description === null && link === null) {
      return '';
    }

    if (description === null && link !== null) {
      return `Extended information in the [EDC public collections repository](${link}).`;
    }

    if (description !== null && link === null) {
      return `${
        description.length > MAX_DESCRIPTION_LENGTH_IN_CHARS
          ? description.substring(0, MAX_DESCRIPTION_LENGTH_IN_CHARS) + '...'
          : description
      }`;
    }

    return `${
      description.length > MAX_DESCRIPTION_LENGTH_IN_CHARS
        ? description.substring(0, MAX_DESCRIPTION_LENGTH_IN_CHARS) + '...'
        : description
    }\n\nExtended information in the [EDC public collections repository](${link}).`;
  };

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
                        key={key}
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
                                className={`selection-item ${
                                  item.uniqueId === openTooltipId ? 'active-tooltip' : ''
                                }`}
                              >
                                {item.title}
                                {shouldShowTooltip && (
                                  <InfoTooltip
                                    text={
                                      <ReactMarkdown
                                        linkTarget="_blank"
                                        children={getMarkdownForCollection(item)}
                                      />
                                    }
                                    setOpenTooltipId={(i) => setOpenTooltipId(i)}
                                    tooltipId={item.uniqueId}
                                    title="Collection description"
                                  />
                                )}
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
                    className={`selection-item ${
                      collection.uniqueId === openTooltipId ? 'active-tooltip' : ''
                    }`}
                    key={collection.uniqueId}
                    onClick={(evt) => {
                      evt.stopPropagation();
                      handleCollectionClick(collection);
                    }}
                  >
                    {collection.title}
                    {shouldShowTooltip && (
                      <InfoTooltip
                        text={
                          <ReactMarkdown
                            linkTarget="_blank"
                            children={getMarkdownForCollection(collection)}
                          />
                        }
                        setOpenTooltipId={(i) => setOpenTooltipId(i)}
                        tooltipId={collection.uniqueId}
                        title="Collection description"
                      />
                    )}
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
