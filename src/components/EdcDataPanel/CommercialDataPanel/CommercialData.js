import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import jwtDecode from 'jwt-decode';

import CommercialDataPanel from './CommercialDataPanel';
import { checkUserAccount } from './commercialData.utils';
import { getServiceHandlerForCollectionType } from '../../../services';
import { COLLECTION_TYPE } from '../../../const';
import { checkIfPublicDeploy } from '../../../utils/envVarsUtils';

import './CommercialData.scss';

const getCommercialDataDescription = () => `
	
Browse, visualise and analyze Very High Resolution (VHR) data directly in EDC Browser, tapping into global archives of [PlanetScope](https://docs.sentinel-hub.com/api/latest/data/planet-scope/), Airbus [Pleiades](https://docs.sentinel-hub.com/api/latest/data/airbus/pleiades/) and [SPOT](https://docs.sentinel-hub.com/api/latest/data/airbus/spot/) as well as [Maxar WorldView](https://docs.sentinel-hub.com/api/latest/data/maxar/world-view/).  

Observe the planet at resolutions starting at 3 meters and all the way up to 0.5 meters for a cost down to 0.9 EUR per km².

![High resolution imagery example.](commercial-data-previews/high-res-image-example.png)

What you need: 
- An active Sentinel Hub subscription to search the metadata. Activate the service [here](https://eurodatacube.com/marketplace/services/edc_sentinel_hub).
- Pre-purchased quota for any of the constellations. Go to [Marketplace](https://eurodatacube.com/marketplace/data-products/commercial-data-sh) to establish a subscription and purchase commercial data plans. 
`;

const CommercialData = ({ collectionsList }) => {
  const [userAccountInfo, setUserAccountInfo] = useState({});
  const sentinelHubHandler = getServiceHandlerForCollectionType(COLLECTION_TYPE.SENTINEL_HUB);
  const shAuthToken = sentinelHubHandler && sentinelHubHandler.token;

  useEffect(() => {
    if (!shAuthToken || checkIfPublicDeploy()) {
      return;
    }
    const user = {
      userdata: jwtDecode(shAuthToken),
      access_token: shAuthToken,
    };
    const fetchUserAccountInfo = async () => {
      let accountInfo = {
        payingAccount: false,
        quotasEnabled: false,
      };
      try {
        accountInfo = await checkUserAccount(user);
      } catch (err) {
        console.error(err);
      } finally {
        setUserAccountInfo(accountInfo);
      }
    };
    fetchUserAccountInfo();
  }, [shAuthToken, setUserAccountInfo]);

  const { payingAccount, quotasEnabled } = userAccountInfo;
  // to enable commercial data tab
  // - user should be logged in
  // - user should have "paying" account
  // Account in considered "paying" if it
  // - is not a trial
  // - has purchased same  quotas
  if (!shAuthToken || !(payingAccount || quotasEnabled)) {
    return (
      <div className="commercial-data-description">
        <ReactMarkdown children={getCommercialDataDescription()} />
      </div>
    );
  }
  return <CommercialDataPanel quotasEnabled={!!quotasEnabled} collectionsList={collectionsList} />;
};

export default CommercialData;
