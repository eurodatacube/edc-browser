import React, { useState } from 'react';
import Rodal from 'rodal';
import moment from 'moment';
import { TPDProvider } from '@sentinel-hub/sentinelhub-js';
import store, { commercialDataSlice } from '../../../../store';

import { NotificationPanel } from '../../../junk/NotificationPanel/NotificationPanel';
import { Button } from '../../../junk/Button/Button';
import PreviewSmall from './PreviewSmall';
import PreviewLarge from './PreviewLarge';
import { filterSearchResults, formatNumberAsRoundedUnit } from '../commercialData.utils';
import Switch from '../../../shared/Switch/Switch';

import './Results.scss';

export const formatDate = (value, formatMask = 'YYYY-MM-DD HH:mm:ss z') =>
  moment.utc(value).format(formatMask);

const ProductProperties = {
  [TPDProvider.AIRBUS]: {
    cloudCover: {
      label: 'Cloud cover',
      format: formatNumberAsRoundedUnit,
    },
    constellation: {
      label: 'Constellation',
    },
    processingLevel: {
      label: 'Processing level',
    },
    snowCover: {
      label: 'Snow cover',
      format: formatNumberAsRoundedUnit,
    },
    incidenceAngle: {
      label: 'Incidence angle',
      format: (value) => formatNumberAsRoundedUnit(value, 2, '°'),
    },
    coverage: {
      label: 'Coverage',
      format: (value) => formatNumberAsRoundedUnit(value * 100, 2, '%'),
    },
  },
  [TPDProvider.PLANET]: {
    cloud_cover: {
      label: 'Cloud cover',
      format: (value) => formatNumberAsRoundedUnit(100 * value, 2),
    },
    snow_ice_percent: {
      label: 'Snow cover',
      format: formatNumberAsRoundedUnit,
    },
    shadow_percent: {
      label: 'Shadow percent',
      format: formatNumberAsRoundedUnit,
    },
    pixel_resolution: {
      label: 'Pixel resolution',
    },
    coverage: {
      label: 'Coverage',
      format: (value) => formatNumberAsRoundedUnit(value * 100, 2, '%'),
    },
  },
  [TPDProvider.MAXAR]: {
    coverage: {
      label: 'Coverage',
      format: (value) => formatNumberAsRoundedUnit(value * 100, 2, '%'),
    },
  },
};

const renderProductDetails = (provider, product) => {
  return (
    <div className="details">
      {Object.keys(product)
        .filter((property) => !['id', 'date', 'geometry'].includes(property))
        .map((property) => (
          <div key={property} className="product-property">
            <div className="bold product-propery-title">
              {ProductProperties[provider] &&
              ProductProperties[provider][property] &&
              ProductProperties[provider][property].label
                ? ProductProperties[provider][property].label
                : property}
              :
            </div>
            <div className="product-propery-text">
              {ProductProperties[provider] &&
              ProductProperties[provider][property] &&
              ProductProperties[provider][property].format
                ? ProductProperties[provider][property].format(product[property])
                : product[property]}
            </div>
          </div>
        ))}
    </div>
  );
};

const Result = ({
  addProduct,
  isSelected,
  product,
  provider,
  removeProduct,
  searchParams,
  setPreviewLarge,
  cachedPreviews,
  setCachedPreviews,
  quotasEnabled,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const toggleDetailsLabel = showDetails ? 'Hide details' : 'Show details';
  return (
    <div
      className="products-container"
      key={product.id}
      onMouseEnter={() => store.dispatch(commercialDataSlice.actions.setHighlightedResult(product))}
      onMouseLeave={() => store.dispatch(commercialDataSlice.actions.setHighlightedResult(null))}
    >
      <div className="product">
        <div className="preview">
          <PreviewSmall
            collectionId={searchParams.dataProvider}
            onClick={setPreviewLarge}
            product={product}
            cachedPreviews={cachedPreviews}
            setCachedPreviews={setCachedPreviews}
          ></PreviewSmall>
          {!!quotasEnabled && !isSelected && (
            <div onClick={() => addProduct(product.id)} className="product-button">
              Add
            </div>
          )}
          {!!quotasEnabled && isSelected && (
            <button className="product-button" onClick={() => removeProduct(product.id)}>
              Remove
            </button>
          )}
        </div>
        <div className="basic-info">
          <div className="basic-info-item">
            <i className="fa fa-info basic-info-icon" />
            <div className="basic-info-text">{product.id}</div>
          </div>

          <div className="basic-info-item">
            <div className="basic-info-title" title={`Accuisition date`}>
              {' '}
            </div>
            <i className="fa fa-calendar basic-info-icon" />
            <div className="basic-info-text">{formatDate(product.date)}</div>
          </div>
          <button
            className="toggle-details"
            title={toggleDetailsLabel}
            onClick={() => setShowDetails(!showDetails)}
          >
            {toggleDetailsLabel}{' '}
            <i className={`fa ${showDetails ? 'fa-angle-double-up' : 'fa-angle-double-down'}`}></i>
          </button>
        </div>
      </div>
      {!!showDetails && renderProductDetails(provider, product)}
    </div>
  );
};

export const Results = ({
  addProduct,
  onCreateOrder,
  provider,
  removeProduct,
  searchParams,
  searchResults,
  selectedProducts,
  location,
  cachedPreviews,
  setCachedPreviews,
  displaySearchResults,
  quotasEnabled,
}) => {
  const [previewLarge, setPreviewLarge] = useState(null);

  if (!searchResults || !searchResults.length) {
    return (
      <div className="commercial-data-results">
        <NotificationPanel msg={`No results found`} type="info" />
      </div>
    );
  }
  const results = filterSearchResults(searchResults, provider);
  return (
    <div className="commercial-data-results">
      <label className="toggle-display-results">
        <Switch
          label="Show results on map"
          checked={displaySearchResults}
          value={displaySearchResults}
          onChange={() =>
            store.dispatch(commercialDataSlice.actions.setDisplaySearchResults(!displaySearchResults))
          }
        />
      </label>
      <div className="commercial-data-results-list">
        {results.map((product) => (
          <Result
            key={product.id}
            provider={provider}
            product={product}
            searchParams={searchParams}
            setPreviewLarge={setPreviewLarge}
            addProduct={addProduct}
            removeProduct={removeProduct}
            isSelected={!!selectedProducts.find((id) => id === product.id)}
            cachedPreviews={cachedPreviews}
            setCachedPreviews={setCachedPreviews}
            searchResults={searchResults}
            quotasEnabled={quotasEnabled}
          />
        ))}
      </div>
      <div className="actions-container">
        <Button fluid onClick={onCreateOrder} text={`Prepare order`} disabled={!quotasEnabled} />
      </div>
      {!!location && (
        <Rodal
          animation="slideUp"
          visible={true}
          width={600}
          height={450}
          onClose={() => store.dispatch(commercialDataSlice.actions.setLocation(null))}
          closeOnEsc={true}
        >
          <div className="commercial-data-results-modal">
            <div className="header">{`Results`}</div>
            <div className="commercial-data-results">
              {filterSearchResults(searchResults, provider, location).map((product) => (
                <Result
                  key={product.id}
                  provider={provider}
                  product={product}
                  searchParams={searchParams}
                  setPreviewLarge={setPreviewLarge}
                  addProduct={addProduct}
                  removeProduct={removeProduct}
                  isSelected={!!selectedProducts.find((id) => id === product.id)}
                  cachedPreviews={cachedPreviews}
                  setCachedPreviews={setCachedPreviews}
                  searchResults={searchResults}
                />
              ))}
            </div>
          </div>
        </Rodal>
      )}
      <PreviewLarge
        imgUrl={previewLarge && previewLarge.url ? previewLarge.url : null}
        onClose={() => setPreviewLarge(null)}
        title={previewLarge && previewLarge.title ? `${previewLarge.title}` : null}
      />
    </div>
  );
};
