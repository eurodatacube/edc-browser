import axios from 'axios';
import { BBox, CRS_EPSG4326, SHV3_LOCATIONS_ROOT_URL, DATASET_BYOC } from '@sentinel-hub/sentinelhub-js';

import AbstractServiceHandler from './AbstractServiceHandler';

import { requestWithTimeout } from '../utils';
import { b64EncodeUnicode } from '../utils/base64MDN';
import { collectionFactory } from './collection';
import { LayersFactory } from './layersFactory';
import { isCustom, getSubTypeAndCollectionId } from '../utils/collections';
import { COLLECTION_TYPE, DEFAULT_TIMEOUT } from '../const';
import { getBoundsAndLatLng } from '../components/EdcDataPanel/CommercialDataPanel/commercialData.utils';
import { createPolygonFromBBox } from '../utils/coords';

const GROUPS = ['Sentinel', 'Landsat', 'ICEYE', 'DEM', 'ALOS'];

export default class EDCHandler extends AbstractServiceHandler {
  HANDLER_ID = 'EDC';

  constructor() {
    super();
    this.EDC_COLLECTIONS_BASE_URL = 'https://collections.eurodatacube.com';
    this.COMMERCIAL_DATA_TAG = 'commercial data';
    this.PUBLIC_DATA_TAG = 'open data';
    this.extents = {};
  }

  async authenticate() {}

  async getCollections() {
    const { data: collectionsList } = await requestWithTimeout(
      (cancelToken) =>
        axios
          .get('https://collections.eurodatacube.com/stac/index.json', { cancelToken: cancelToken })
          .catch((err) => {
            console.error(err);
            throw new Error('Fetching EDC collections failed.');
          }),
      DEFAULT_TIMEOUT,
    );
    const allCollections = await Promise.all(
      collectionsList.map(async (c) => {
        const { data } = await requestWithTimeout(
          (cancelToken) =>
            axios.get(c.link, { cancelToken: cancelToken }).catch((err) => {
              console.error(`Failed to load data for ${c.id}`);
              return null;
            }),
          DEFAULT_TIMEOUT,
        );
        return data;
      }),
    );
    return this._parseCollections(allCollections.filter((c) => c !== null));
  }

  _parseCollections(collections) {
    const publicCollections = collections.filter((collection) =>
      collection.keywords.includes(this.PUBLIC_DATA_TAG),
    );
    const commercialCollections = collections.filter((collection) =>
      collection.keywords.includes(this.COMMERCIAL_DATA_TAG),
    );

    return {
      public: publicCollections.map((collection) => {
        const { subType, collectionId } = getSubTypeAndCollectionId(collection.datasource_type);
        this.extents[collection.id] = collection.extent;
        return collectionFactory({
          uniqueId: collection.id,
          id: collection.id,
          title: collection.title,
          type: COLLECTION_TYPE.SENTINEL_HUB_EDC,
          group: this._getGroupName(collection.title),
          ownedByUser: true,
          configurations: collection.links.filter((l) => l.rel === 'processing-expression'),
          bands: collection['cube:dimensions'].band.values,
          serviceSpecificInfo: {
            type: isCustom(collection.datasource_type) ? DATASET_BYOC.id : collection.datasource_type,
            providers: collection.providers,
            locationId: this.getLocationId(collection.providers),
            subType: subType,
            collectionId: collectionId,
          },
        });
      }),
      commercial: commercialCollections.map((collection) =>
        collectionFactory({
          uniqueId: collection.id,
          id: collection.id,
          type: COLLECTION_TYPE.SENTINEL_HUB_EDC,
          group: this._getGroupName(collection.title),
          ownedByUser: false,
        }),
      ),
    };
  }

  _getGroupName(name) {
    return GROUPS.find((group) => name.match(group)) ?? 'Miscellaneous';
  }

  getLocationId(providers) {
    let { url: host } = providers.find((p) => p.roles.includes('processor'));
    return Object.keys(SHV3_LOCATIONS_ROOT_URL).find((key) => {
      const url = new URL(SHV3_LOCATIONS_ROOT_URL[key]);
      return url.host === host;
    });
  }

  static getCheckoutUrl(algorithm, inputValues) {
    const payload = {
      name: algorithm,
      inputValues: inputValues,
    };
    const encoded = b64EncodeUnicode(JSON.stringify(payload));
    return `https://eurodatacube.com/checkout?item=${encoded}`;
  }

  static getAlgorithms() {
    return requestWithTimeout(
      (cancelToken) =>
        axios
          .get(`https://api.eurodatacube.com/algorithms/`)
          .then((r) => r.data)
          .catch((err) => {
            console.error(err);
            throw new Error('Fetching algorithms failed.');
          }),
      DEFAULT_TIMEOUT,
    );
  }

  async getBestInitialLocation(collectionId) {
    if (this.extents[collectionId]) {
      const bboxes = this.extents[collectionId].spatial.bbox;
      const polygon = createPolygonFromBBox(bboxes[bboxes.length - 1]);
      return getBoundsAndLatLng(polygon);
    }
    return null;
  }

  async getAvailableDates(collection, bounds, fromTime, toTime) {
    if (collection.type === COLLECTION_TYPE.SENTINEL_HUB_EDC) {
      const searchLayer = LayersFactory(collection, null, true, '');
      const bbox = new BBox(
        CRS_EPSG4326,
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      );
      return await searchLayer.findDatesUTC(bbox, fromTime, toTime);
    }
    return [];
  }

  supportsDateSelection(collectionType) {
    if (collectionType === COLLECTION_TYPE.SENTINEL_HUB_EDC) {
      return true;
    }
    return false;
  }

  supportsCustomScript(collectionType) {
    if (collectionType === COLLECTION_TYPE.SENTINEL_HUB_EDC) {
      return true;
    }
    return false;
  }
}
