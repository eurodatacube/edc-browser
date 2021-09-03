import React from 'react';
import { connect } from 'react-redux';
import geo_area from '@mapbox/geojson-area';
import Toggle from 'react-toggle';
import { PlanetProductBundle, TPDICollections } from '@sentinel-hub/sentinelhub-js';

import { NotificationPanel } from '../../../junk/NotificationPanel/NotificationPanel';
import { Button } from '../../../junk/Button/Button';
import { CollectionSelection } from './CollectionSelection';
import { OrderInputTooltip } from './OrderInputTooltip';

import 'react-toggle/style.css';
import './OrderOptions.scss';

export const OrderType = {
  PRODUCTS: 'PRODUCTS',
  QUERY: 'QUERY',
};

const OrderTypeLabel = {
  [OrderType.PRODUCTS]: 'Products',
  [OrderType.QUERY]: 'Query',
};

const getOrderSize = (aoiGeometry, orderOptions, selectedProducts = [], searchResults = []) => {
  if (!aoiGeometry) {
    return 0;
  }

  switch (orderOptions.type) {
    case OrderType.PRODUCTS:
      //order size is number of products * area
      return selectedProducts && selectedProducts.length
        ? (selectedProducts.length *
            Math.round((parseFloat(geo_area.geometry(aoiGeometry)) / 1000000) * Math.pow(10, 2))) /
            Math.pow(10, 2)
        : 0;
    case OrderType.QUERY:
      //approx order size equals area of interest * number of results
      return (
        (searchResults.length *
          Math.round((parseFloat(geo_area.geometry(aoiGeometry)) / 1000000) * Math.pow(10, 2))) /
        Math.pow(10, 2)
      );
    default:
      return 0;
  }
};

const SelectedProducts = ({ selectedProducts, removeProduct }) => {
  return (
    <div className="row">
      <label title="Products">{`Products`}</label>
      <div className="selected-products">
        {selectedProducts.map((id) => (
          <div className="selected-product" key={id}>
            <div>{id}</div>
            <i className="fa fa-trash-o" onClick={() => removeProduct(id)}></i>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderOptions = ({
  actionError,
  actionInProgress,
  aoiGeometry,
  onCreateOrder,
  orderOptions,
  removeProduct,
  searchParams,
  searchResults,
  selectedProducts,
  setOrderOptions,
  setConfirmAction,
}) => {
  const validateInputs = () => {
    //order name must be entered
    const { name, type, limit, planetApiKey } = orderOptions;
    if (!name) {
      return false;
    }

    if (type === OrderType.PRODUCTS && !!selectedProducts && !selectedProducts.length) {
      return false;
    }

    if (getOrderSize(aoiGeometry, orderOptions, selectedProducts, searchResults) > limit) {
      return false;
    }

    if (searchParams && searchParams.dataProvider === TPDICollections.PLANET_SCOPE && !planetApiKey) {
      return false;
    }

    return !!aoiGeometry;
  };

  const createOrderHandler = () => {
    if (!orderOptions.collectionId) {
      setConfirmAction({
        title: 'Creating order',
        message:
          'Are you sure you want to create an order without a Collection ID?  \n When you confirm your order a new collection will be created automatically.',
        action: () => {
          onCreateOrder();
          setConfirmAction(null);
        },
        showCancel: true,
      });
      return;
    }

    onCreateOrder();
  };

  return (
    <div className="commercial-data-order-options">
      <div className="row">
        <label title="Name">{`Order name`}</label>
        <div>
          <input
            className="input-primary compact"
            defaultValue={orderOptions.name}
            disabled={!!actionInProgress}
            placeholder="e.g.: My planet data"
            onChange={(e) => setOrderOptions({ ...orderOptions, name: e.target.value })}
          ></input>
          <OrderInputTooltip inputId="name" />
        </div>
      </div>
      <div className="row">
        <label title="Order type">{`Order type`}</label>
        <div>
          <select
            className="dropdown-primary compact"
            disabled={!!actionInProgress}
            value={orderOptions.type}
            onChange={(e) => setOrderOptions({ ...orderOptions, type: OrderType[e.target.value] })}
          >
            {Object.keys(OrderType).map((type, index) => (
              <option key={index} value={type}>
                {OrderTypeLabel[type]}
              </option>
            ))}
          </select>
          <OrderInputTooltip inputId="type" />
        </div>
      </div>
      {orderOptions.type === OrderType.PRODUCTS && (
        <SelectedProducts selectedProducts={selectedProducts} removeProduct={removeProduct} />
      )}
      <CollectionSelection
        disabled={!!actionInProgress}
        orderOptions={orderOptions}
        setOrderOptions={setOrderOptions}
        searchParams={searchParams}
      />
      <div className="row">
        <label title="Order size (approx.)">{`Order size (approx.)`}</label>
        <div>
          <label>
            {!!aoiGeometry ? (
              <>
                {getOrderSize(aoiGeometry, orderOptions, selectedProducts, searchResults)} {`km`}
                <sup>2</sup>
              </>
            ) : null}
          </label>
          <OrderInputTooltip inputId="size" />
        </div>
      </div>

      <div className="row">
        <label title="Order limit">{`Order limit (km2)`}</label>
        <div>
          <input
            className="input-primary compact"
            type="number"
            disabled={!!actionInProgress}
            defaultValue={orderOptions.limit}
            onChange={(e) => setOrderOptions({ ...orderOptions, limit: e.target.value })}
            placeholder="km2"
          ></input>
          <OrderInputTooltip inputId="limit" />
        </div>
      </div>
      {searchParams && searchParams.dataProvider === TPDICollections.PLANET_SCOPE && (
        <>
          <div className="row">
            <label title={`Harmonize data`}>{`Harmonize data`}</label>
            <div>
              <Toggle
                defaultChecked={orderOptions.harmonizeData}
                disabled={
                  !!actionInProgress ||
                  searchParams.productBundle === PlanetProductBundle.ANALYTIC_SR_UDM2 ||
                  searchParams.productBundle === PlanetProductBundle.ANALYTIC_SR
                }
                icons={false}
                onChange={() =>
                  setOrderOptions({ ...orderOptions, harmonizeData: !orderOptions.harmonizeData })
                }
              />
              <OrderInputTooltip inputId="harmonizeData" />
            </div>
          </div>

          <div className="row">
            <label title="Planet API Key">{`Planet API Key`}</label>
            <div>
              <input
                className="input-primary compact"
                type="text"
                disabled={!!actionInProgress}
                defaultValue={orderOptions.planetApiKey}
                onChange={(e) => setOrderOptions({ ...orderOptions, planetApiKey: e.target.value })}
                placeholder="Your Planet API key"
              ></input>
              <OrderInputTooltip inputId="planetApiKey" />
            </div>
          </div>
        </>
      )}
      <div className="order-actions">
        <Button
          fluid
          onClick={createOrderHandler}
          disabled={!validateInputs() || !!actionInProgress}
          text={`Create order`}
          loading={actionInProgress}
        />
        <OrderInputTooltip inputId="createOrder" />
      </div>

      {actionError && <NotificationPanel type="error" msg={actionError} />}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  aoiGeometry: store.aoi.geometry,
});

export default connect(mapStoreToProps, null)(OrderOptions);
