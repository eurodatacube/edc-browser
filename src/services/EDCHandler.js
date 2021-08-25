import axios from 'axios';
import { BBox, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';

import AbstractServiceHandler from './AbstractServiceHandler';

import { requestWithTimeout } from '../utils';
import { b64EncodeUnicode } from '../utils/base64MDN';
import { collectionFactory } from './collection';
import { LayersFactory } from './layersFactory';
import { COLLECTION_TYPE, DEFAULT_TIMEOUT } from '../const';

const GROUPS = ['Sentinel', 'Landsat', 'ICEYE', 'DEM', 'ALOS'];

export default class EDCHandler extends AbstractServiceHandler {
  HANDLER_ID = 'EDC';

  constructor() {
    super();
    this.EDC_COLLECTIONS_BASE_URL = 'https://collections.eurodatacube.com';
    this.COMMERCIAL_DATA_TAG = 'commercial data';
    this.PUBLIC_DATA_TAG = 'open data';
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
      public: publicCollections.map((collection) =>
        collectionFactory({
          uniqueId: collection.id,
          id: collection.id,
          type: COLLECTION_TYPE.SENTINEL_HUB_EDC,
          group: this._getGroupName(collection.title),
          ownedByUser: true,
          configurations: collection.links.filter((l) => l.rel === 'processing-expression'),
          serviceSpecificInfo: {
            type: collection.datasource_type,
            providers: collection.providers,
          },
        }),
      ),
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

  static getCheckoutUrl(algorithm, inputValues) {
    const payload = {
      name: algorithm,
      inputValues: inputValues,
    };
    const encoded = b64EncodeUnicode(JSON.stringify(payload));
    return `https://eurodatacube.com/checkout?item=${encoded}`;
  }

  static getAlgorithms_ACTUAL() {
    return axios.get(`https://api.eurodatacube.com/algorithms/`).then((r) => r.data);
  }

  async getBestInitialLocation(database, collectionId) {
    return null;
  }

  static getAlgorithms() {
    console.warn('getAlgorithms() returns mocked data!');
    return [
      {
        name: 'truck-detection',
        version: 'c8ac322def442b5d3e7fa741fbdd2b5e8f47a3c0',
        link: 'https://collections.eurodatacube.com/truck-detection/',
        inputs: [
          {
            name: 'Area of Interest',
            id: 'aoi',
            type: 'bbox',
            description: '',
            optional: false,
            restriction: {
              type: 'geometry',
              value: 'POLYGON((-15.3 71.3, 40.6 71.3, 40.6 35.1, -15.3 35.1, -15.3 71.3))',
            },
          },
          {
            name: 'CRS of AOI',
            id: 'projection',
            type: 'crs',
            describes: 'aoi',
            description: 'EPSG code of AOI CRS',
            optional: false,
            restriction: {
              type: 'choice',
              value: [
                2154, 2180, 2193, 3003, 3004, 3031, 3035, 4326, 4346, 4416, 4765, 4794, 4844, 4857, 3912,
                3995, 4026, 5514, 28992, 32601, 32602, 32603, 32604, 32605, 32606, 32607, 32608, 32609, 32610,
                32611, 32612, 32613, 32614, 32615, 32616, 32617, 32618, 32619, 32620, 32621, 32622, 32623,
                32624, 32625, 32626, 32627, 32628, 32629, 32630, 32631, 32632, 32633, 32634, 32635, 32636,
                32637, 32638, 32639, 32640, 32641, 32642, 32643, 32644, 32645, 32646, 32647, 32648, 32649,
                32650, 32651, 32652, 32653, 32654, 32655, 32656, 32657, 32658,
              ],
            },
          },
          {
            name: 'Time range',
            id: 'time_period',
            type: 'daterange',
            optional: false,
            description: '',
          },
          {
            name: 'OSM Values',
            id: 'osm_values',
            type: 'stringlist',
            description:
              'Trucks are only detected on roads obtained from OSM. You may specify road types to include. Their descriptions can be found at: https://wiki.openstreetmap.org/wiki/Key:highway',
            optional: false,
            restriction: {
              type: 'multiple choice',
              value: ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
            },
          },
          {
            name: 'Max. cloud coverage',
            id: 'maxCC',
            type: 'float',
            description: 'Maximal cloud coverage in per centage',
            optional: true,
            restriction: {
              type: 'range',
              value: [0, 100],
            },
          },
          {
            name: 'Week days',
            id: 'week_days',
            type: 'stringlist',
            description: 'Days of the week for which the algorithm will run in the selected time range',
            optional: true,
            restriction: {
              type: 'multiple choice',
              value: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            },
          },
        ],
      },
    ];
  }

  async getAvailableDates(collection, layerId, bounds, fromTime, toTime) {
    if (collection.type === COLLECTION_TYPE.SENTINEL_HUB_EDC) {
      const searchLayer = LayersFactory(collection, layerId);
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
}
