import axios from 'axios';
import moment from 'moment';
import center from '@turf/center';
import {
  requestAuthToken,
  setAuthToken,
  DATASET_BYOC,
  BYOCLayer,
  BBox,
  CRS_EPSG4326,
  BYOCSubTypes,
} from '@sentinel-hub/sentinelhub-js';

import AbstractServiceHandler from './AbstractServiceHandler';

import { collectionFactory } from './collection';
import { generateConfigurationsFromBands } from '../utils/evalscript';
import { COLLECTION_TYPE, DEFAULT_FROM_TIME, DEFAULT_TIMEOUT } from '../const';
import { requestWithTimeout } from '../utils';

export default class SentinelHubHandler extends AbstractServiceHandler {
  HANDLER_ID = 'SENTINEL_HUB';

  constructor({ CLIENT_ID, CLIENT_SECRET }) {
    super();
    this.CLIENT_ID = CLIENT_ID;
    this.CLIENT_SECRET = CLIENT_SECRET;
    this.token = null;
  }

  async authenticate() {
    if (this.CLIENT_ID && this.CLIENT_SECRET) {
      this.token = await requestAuthToken(this.CLIENT_ID, this.CLIENT_SECRET);
      setAuthToken(this.token);
    }
  }

  async getCollections() {
    const allCollections = [];
    const params = {
      count: 100,
    };
    while (true) {
      const {
        data: { data, links },
      } = await requestWithTimeout(
        (cancelToken) =>
          axios
            .get('https://services.sentinel-hub.com/api/v1/byoc/collections', {
              params: params,
              cancelToken: cancelToken,
              headers: { Authorization: `Bearer ${this.token}` },
            })
            .catch((err) => {
              console.error(err);
              throw new Error('Fetching user BYOC collections failed.');
            }),
        DEFAULT_TIMEOUT,
      );
      allCollections.push(...data);

      if (!links.nextToken) {
        break;
      }
      params.viewToken = links.nextToken;
    }

    return {
      user: allCollections.map((collection) =>
        collectionFactory({
          uniqueId: collection.id,
          id: collection.id,
          type: COLLECTION_TYPE.SENTINEL_HUB,
          group: collection.name,
          configurations: this.getConfigurations(collection),
          ownedByUser: true,
          serviceSpecificInfo: {
            type: DATASET_BYOC.id,
          },
        }),
      ),
    };
  }

  getConfigurations(data) {
    if (data.additionalData && data.additionalData.bands) {
      return generateConfigurationsFromBands(data.additionalData.bands);
    }
    return [];
  }

  async getBestInitialLocation(collectionId) {
    const searchLayer = new BYOCLayer({
      instanceId: true,
      layerId: true,
      evalscript: '//',
      collectionId: collectionId,
      subType: BYOCSubTypes.BYOC,
    });
    const bbox = new BBox(CRS_EPSG4326, -180, -90, 180, 90);
    const fromTime = DEFAULT_FROM_TIME;
    const toTime = moment.utc();
    const { tiles } = await searchLayer.findTiles(bbox, fromTime, toTime, 1);
    if (!tiles.length) {
      return null;
    }
    const [lng, lat] = center(tiles[0].geometry).geometry.coordinates;
    return { lat: lat, lng: lng };
  }
}
