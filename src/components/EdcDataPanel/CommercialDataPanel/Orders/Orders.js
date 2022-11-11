import React, { useEffect, useLayoutEffect, useState } from 'react';
import moment from 'moment';
import { TPDITransactionStatus, TPDI, TPDProvider } from '@sentinel-hub/sentinelhub-js';
import {
  extractErrorMessage,
  fetchOrders,
  getBoundsAndLatLng,
  formatNumberAsRoundedUnit,
  showDataOnMap,
  getOrderCollection,
} from '../commercialData.utils';
import store, { commercialDataSlice, mainMapSlice, visualizationSlice } from '../../../../store';
import { NotificationPanel } from '../../../junk/NotificationPanel/NotificationPanel';
import { Button } from '../../../junk/Button/Button';
import ExternalLink from '../../../ExternalLink/ExternalLink';

import { COLLECTION_TYPE } from '../../../../const';

import './Orders.scss';
import { getServiceHandlerForCollectionType } from '../../../../services';

const orderStatus = [
  {
    status: TPDITransactionStatus.CREATED,
    title: 'Created orders (Not confirmed)',
  },
  {
    status: TPDITransactionStatus.RUNNING,
    title: 'Running orders',
  },
  {
    status: TPDITransactionStatus.DONE,
    title: 'Finished orders',
  },
];

const OrderProperties = {
  created: {
    label: 'Created at',
    format: (value) => moment.utc(value).format('YYYY-MM-DD HH:mm:ss'),
  },
  confirmed: {
    label: 'Confirmed at',
    format: (value) => moment.utc(value).format('YYYY-MM-DD HH:mm:ss'),
  },
  provider: {
    label: 'Provider',
  },
  sqkm: {
    label: 'Size',
    format: (value) => formatNumberAsRoundedUnit(value, 2, 'km²'),
  },
  status: {
    label: 'Status',
  },
  input: {
    label: 'All input parameters',
  },
  id: {
    label: 'Order ID',
  },
  collectionId: {
    label: 'Collection ID',
  },
};

const JSONProperty = (order, property) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const value = order[property];

  if (!value) {
    return null;
  }

  return (
    <>
      <div key={OrderProperties[property].label} className="order-property">
        <div>
          {OrderProperties[property] && OrderProperties[property].label
            ? OrderProperties[property].label
            : property}
          :
        </div>
        <div>
          <i
            className={`fa fa-eye${isExpanded ? '-slash' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            title={`${isExpanded ? `Hide ${property} values` : `Show ${property} values`}`}
          ></i>
        </div>
      </div>

      {isExpanded && (
        <div className="order-property-json">
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      )}
    </>
  );
};

const OrderDetails = ({ order, setAction, orderCollection }) => {
  const orderButtons = [
    {
      title: 'Confirm',
      onClick: () => setAction('confirmOrder', order),
      status: [TPDITransactionStatus.CREATED],
      icon: 'check',
      hidden: false,
    },
    {
      title: 'Delete',
      onClick: () => setAction('deleteOrder', order),
      status: [TPDITransactionStatus.CREATED, TPDITransactionStatus.DONE],
      icon: 'trash',
      hidden: false,
    },
    {
      title: 'Show coverage',
      onClick: () => {
        if (order && order.input && order.input.bounds && order.input.bounds.geometry) {
          store.dispatch(commercialDataSlice.actions.setSelectedOrder(order));
          store.dispatch(
            visualizationSlice.actions.setVisualizationParams({
              collectionId: null,
            }),
          );
          const { lat, lng, zoom } = getBoundsAndLatLng(order.input.bounds.geometry);
          store.dispatch(mainMapSlice.actions.setPosition({ lat: lat, lng: lng, zoom: zoom }));
        }
      },
      status: [TPDITransactionStatus.CREATED, TPDITransactionStatus.DONE, TPDITransactionStatus.RUNNING],
      icon: 'crosshairs',
      hidden: false,
    },
    {
      title: 'Show data',
      onClick: async () => {
        await showDataOnMap(order, orderCollection);
      },
      status: [TPDITransactionStatus.DONE],
      icon: 'map',
      hidden: !orderCollection,
    },
  ];

  return (
    <div className="order-details">
      <div className="order-properties">
        {Object.keys(order)
          .filter((property) => !['name', 'userId', 'geometry', 'input'].includes(property))
          .map((property) => (
            <div key={property} className="order-property">
              <div>
                {OrderProperties[property] && OrderProperties[property].label
                  ? OrderProperties[property].label
                  : property}
                :
              </div>
              <div>
                {OrderProperties[property] && OrderProperties[property].format
                  ? OrderProperties[property].format(order[property])
                  : order[property]}
              </div>
            </div>
          ))}
        {}
      </div>
      {JSONProperty(order, 'input')}

      {order.provider === TPDProvider.PLANET && (
        <NotificationPanel>
          {`Note that it is technically possible to order more Planet PlanetScope data than your purchased quota. Make sure your order is in line with the Hectares under Management (HUM) model to avoid overage fees. `}
          <ExternalLink href="https://www.sentinel-hub.com/faq/#how-the-planetscope-hectares-under-management-works">
            {`More information`}
          </ExternalLink>
        </NotificationPanel>
      )}

      <div className="buttons">
        {orderButtons
          .filter((button) => button.status.includes(order.status) && !button.hidden)
          .map((button, index) => (
            <Button
              key={`${order.id}-${index}`}
              onClick={() => button.onClick(order)}
              text={button.title}
              title={button.title}
              icon={button.icon}
            />
          ))}
      </div>
    </div>
  );
};

const Order = ({ activeOrderId, order, setAction, setActiveOrderId, refs, orderCollection }) => {
  const [showDetails, setShowDetails] = useState(order.id === activeOrderId);

  useLayoutEffect(() => {
    if (activeOrderId && activeOrderId === order.id)
      refs[order.id].current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  }, [activeOrderId, order, refs]);

  return (
    <div className="order" ref={refs[order.id]}>
      <div
        className="order-header"
        onClick={() => {
          if (showDetails && activeOrderId === order.id) {
            setActiveOrderId(null);
          }
          setShowDetails(!showDetails);
        }}
      >
        <div className="order-title">
          <div>{order.name}</div>
          <div>{moment.utc(order.created).format('YYYY-MM-DD')}</div>
        </div>
        <div className="toggle-details">
          <i className={`fa fa-chevron-${showDetails ? 'up' : 'down'}`} />
        </div>
      </div>
      {!!showDetails && (
        <OrderDetails order={order} setAction={setAction} orderCollection={orderCollection} />
      )}
    </div>
  );
};

const OrdersByStatus = ({
  activeOrderId,
  orders,
  status,
  setAction,
  setActiveOrderId,
  title,
  userByocLayers,
}) => {
  const filteredOrders = orders
    .filter((order) => order.status === status)
    .sort((a, b) => moment.utc(b.created).diff(moment.utc(a.created)));

  const refs = filteredOrders.reduce((acc, order) => {
    acc[order.id] = React.createRef();
    return acc;
  }, {});

  return (
    <div className="orders-list">
      <div className="order-status">{title}</div>
      {filteredOrders.length ? (
        <div className="orders">
          {filteredOrders.map((order) => (
            <Order
              key={order.id}
              refs={refs}
              order={order}
              status={status}
              setAction={setAction}
              setActiveOrderId={setActiveOrderId}
              activeOrderId={activeOrderId}
              orderCollection={getOrderCollection(userByocLayers, order.collectionId)}
            />
          ))}
        </div>
      ) : (
        <NotificationPanel msg={`No orders found`} type="info" />
      )}
    </div>
  );
};

export const Orders = ({ activeOrderId, setActiveOrderId, setConfirmAction, collectionsList }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [userByocLayers, setUserByocLayers] = useState([]);

  const shAuthToken = getServiceHandlerForCollectionType(COLLECTION_TYPE.SENTINEL_HUB).token;

  const fetchData = async (authToken, collectionsList) => {
    try {
      setIsLoading(true);
      setError(null);
      const allOrders = await fetchOrders(authToken);
      const byocLayers =
        collectionsList && collectionsList.user
          ? collectionsList.user.filter(
              (collection) => collection.ownedByUser && collection.type === COLLECTION_TYPE.SENTINEL_HUB,
            )
          : [];

      setOrders(allOrders);
      setUserByocLayers(byocLayers);
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err));
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(shAuthToken, collectionsList);
  }, [shAuthToken, collectionsList]);

  const confirmOrderAction = async (order) => {
    try {
      const requestsConfig = {
        authToken: shAuthToken,
      };
      const confirmedOrder = await TPDI.confirmOrder(order.id, requestsConfig);
      setActiveOrderId(order.id);
      setOrders([...orders.filter((o) => o.id !== order.id), { ...confirmedOrder }]);
      setConfirmAction(null);
    } catch (err) {
      console.error(err);
      setConfirmAction({
        title: 'Error confirming order',
        message: extractErrorMessage(err),
        action: () => setConfirmAction(null),
        showCancel: false,
      });
    }
  };

  const deleteOrderAction = async (order) => {
    try {
      const requestsConfig = {
        authToken: shAuthToken,
      };
      await TPDI.deleteOrder(order.id, requestsConfig);
      setOrders(orders.filter((o) => o.id !== order.id));
      if (!!activeOrderId) {
        setActiveOrderId(null);
      }
      setConfirmAction(null);
    } catch (err) {
      console.error(err);
      setConfirmAction({
        title: 'Error deleting order',
        message: extractErrorMessage(err),
        action: () => setConfirmAction(null),
        showCancel: false,
      });
    }
  };

  const setAction = (action, order) => {
    switch (action) {
      case 'confirmOrder':
        setConfirmAction({
          title: 'Confirm order',
          message: 'Are you sure you want to confirm this order?',
          action: () => confirmOrderAction(order),
          showCancel: true,
        });
        break;
      case 'deleteOrder':
        setConfirmAction({
          title: 'Delete order',
          message: 'Are you sure you want to delete this order?',
          action: () => deleteOrderAction(order),
          showCancel: true,
        });
        break;

      default:
    }
  };

  return (
    <div className="commercial-data-orders">
      {isLoading ? (
        <div className="loader">
          <i className="fa fa-spinner fa-spin fa-fw" />
        </div>
      ) : (
        orderStatus.map((item) => (
          <OrdersByStatus
            key={item.status}
            orders={orders}
            status={item.status}
            title={item.title}
            setAction={setAction}
            activeOrderId={activeOrderId}
            setActiveOrderId={setActiveOrderId}
            userByocLayers={userByocLayers}
          />
        ))
      )}
      <div className="actions-container">
        <Button text="Refresh orders" fluid disabled={isLoading} onClick={() => fetchData(shAuthToken)} />
      </div>
      {!!error && <NotificationPanel type="error" msg={error} />}
    </div>
  );
};

export default Orders;
