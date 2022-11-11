import React, { useState, useEffect } from 'react';
import { TPDI, TPDICollections } from '@sentinel-hub/sentinelhub-js';
import { NotificationPanel } from '../../../junk/NotificationPanel/NotificationPanel';
import { Button } from '../../../junk/Button/Button';
import { formatNumberAsRoundedUnit } from '../commercialData.utils';

import './Quotas.scss';
import { getServiceHandlerForCollectionType } from '../../../../services';
import { COLLECTION_TYPE } from '../../../../const';

const Providers = {
  [TPDICollections.AIRBUS_PLEIADES]: 'Airbus Pleiades',
  [TPDICollections.AIRBUS_SPOT]: 'Airbus SPOT',
  [TPDICollections.PLANET_SCOPE]: 'Planet PlanetScope',
  [TPDICollections.MAXAR_WORLDVIEW]: 'Maxar WorldView',
  [TPDICollections.PLANET_SKYSAT]: 'Planet SkySat',
};

function renderQuotas(quotas) {
  return (
    <>
      <table>
        <thead>
          <tr>
            <td>Provider</td>
            <td>
              Purchased km<sup>2</sup>
            </td>
            <td>
              Used km<sup>2</sup>
            </td>
          </tr>
        </thead>
        <tbody>
          {quotas.map((quota) => {
            return (
              <tr key={quota.id}>
                <td>{`${Providers[quota.collectionId]}`}</td>
                <td>{`${formatNumberAsRoundedUnit(quota.quotaSqkm, 2, '')}`}</td>
                <td>{`${formatNumberAsRoundedUnit(quota.quotaUsed, 2, '')}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {quotas && quotas.length === 0 && <NotificationPanel msg={`No quotas available`} type="info" />}
    </>
  );
}

const Quotas = () => {
  const [quotas, setQuotas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const shAuthToken = getServiceHandlerForCollectionType(COLLECTION_TYPE.SENTINEL_HUB).token;

  const fetchQuotas = async (shAuthToken) => {
    if (shAuthToken) {
      try {
        setIsLoading(true);
        setError(null);
        const requestsConfig = {
          authToken: shAuthToken,
        };
        const result = await TPDI.getQuotas(requestsConfig);
        setQuotas(result.sort((a, b) => a.collectionId.localeCompare(b.collectionId)));
      } catch (err) {
        console.error(err);
        setError(`Unable to get quotas: ${err.message}`);
        setQuotas([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchQuotas(shAuthToken);
  }, [shAuthToken]);

  return (
    <div className="commercial-data-quotas">
      {renderQuotas(quotas)}
      <Button
        loading={isLoading}
        disabled={isLoading}
        fluid
        onClick={() => fetchQuotas(shAuthToken)}
        text={`Refresh quotas`}
      />
      {!!error && <NotificationPanel type="error" msg={error} />}
    </div>
  );
};

export default Quotas;
