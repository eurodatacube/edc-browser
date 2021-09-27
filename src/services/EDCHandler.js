import axios from 'axios';
import { BBox, CRS_EPSG4326, SHV3_LOCATIONS_ROOT_URL, DATASET_BYOC } from '@sentinel-hub/sentinelhub-js';

import AbstractServiceHandler from './AbstractServiceHandler';

import { requestWithTimeout } from '../utils';
import { b64EncodeUnicode } from '../utils/base64MDN';
import { collectionFactory } from './collection';
import { LayersFactory } from './layersFactory';
import { isCustom, getSubTypeAndCollectionId } from '../utils/collections';
import { COLLECTION_TYPE, DEFAULT_TIMEOUT, EDC_PUBLIC_GROUPS } from '../const';
import { getBoundsAndLatLng } from '../components/EdcDataPanel/CommercialDataPanel/commercialData.utils';
import { createPolygonFromBBox } from '../utils/coords';

const evalscriptCHL = `
//VERSION=3
function setup() {
    return {
      input: ["CHL"],
      output: { bands: 3}
    }
}

function evaluatePixel(sample) {
    if (sample.CHL == -999)
        return [0,0,0]
    else
        var viz = valueInterpolate(sample.CHL, [0, 0.5, 1, 2, 3, 4.5, 13, 25, 30, 40], [
          [0,0,128/255],
          [0,0,255/255],
          [51/255,102/255,255/255],
          [0,204/255,255/255],
          [0,255/255,255/255],
          [0,128/255,0],
          [255/255,255/255,0],
          [255/255,95/255,0],
          [215/255,0,0],
          [150/255,0,0]
        ]);
        return viz
}
`;

const evalscriptKD490 = `
//VERSION=3
function setup() {
    return {
      input: ["KD490"],
      output: { bands: 3}
    }
}

function evaluatePixel(sample) {
    if (sample.KD490 == -999)
        return [0,0,0]
    else
        var viz = valueInterpolate(sample.KD490, [0, 0.2], [
          [0, 0, 128/255],
          [255/255, 0, 0],
        ]);
        return viz
}
`;

const MOCKED_ZARR_COLLECTIONS = [
  {
    type: 'Collection',
    stac_version: '1.0.0',
    stac_extensions: ['datacube'],
    id: 'oceancolour_bal_chl_l3_nrt_observations_009_049',
    datasource_type: 'zarr-1e715627-1ad0-4c42-8525-28b98c5c334b',
    title: 'OCEANCOLOUR_BAL_CHL_L3_NRT_OBSERVATIONS_009_049',
    description: 'Some description',
    keywords: ['open data', 'sentinel hub', 'raster', 'race challenges', 'Copernicus service'],
    license: '',
    providers: [
      {
        name: 'Sentinel Hub',
        description: '',
        roles: ['processor'],
        url: 'services.sentinel-hub.com',
      },
    ],
    extent: {
      spatial: { bbox: [[18, 58, 20, 60]] },
      temporal: { interval: [['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z']] },
    },
    links: [
      {
        href: 'https://collections.eurodatacube.com//stac/cams_glc_2017.json',
        rel: 'self',
      },
      {
        href: '',
        rel: 'license',
      },
      {
        layer_name: 'CHL visualization',
        evalscript: evalscriptCHL,
        mosaicking_order: 'mostRecent',
        upsampling: 'BICUBIC',
        href: 'https://docs.sentinel-hub.com/api/latest/api/process/',
        rel: 'processing-expression',
      },
    ],
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [18, 20] },
      y: { type: 'spatial', axis: 'y', extent: [58, 60] },
      t: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z'] },
      band: { type: 'bands', values: ['CHL'] },
    },
  },
  {
    type: 'Collection',
    stac_version: '1.0.0',
    stac_extensions: ['datacube'],
    id: 'oceancolour_atl_chl_l4_nrt_observations_009_037',
    datasource_type: 'zarr-f10c203b-40ac-4c3f-b16e-61d0679c6345',
    title: 'OCEANCOLOUR_ATL_CHL_L4_NRT_OBSERVATIONS_009_037',
    description: 'Some description',
    keywords: ['open data', 'sentinel hub', 'raster', 'race challenges', 'Copernicus service'],
    license: '',
    providers: [
      {
        name: 'Sentinel Hub',
        description: '',
        roles: ['processor'],
        url: 'services.sentinel-hub.com',
      },
    ],
    extent: {
      spatial: { bbox: [[-8, 50, 0, 58]] },
      temporal: { interval: [['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z']] },
    },
    links: [
      {
        href: 'https://collections.eurodatacube.com//stac/cams_glc_2017.json',
        rel: 'self',
      },
      {
        href: '',
        rel: 'license',
      },
      {
        layer_name: 'CHL visualization',
        evalscript: evalscriptCHL,
        mosaicking_order: 'mostRecent',
        upsampling: 'BICUBIC',
        href: 'https://docs.sentinel-hub.com/api/latest/api/process/',
        rel: 'processing-expression',
      },
    ],
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [-8, 0] },
      y: { type: 'spatial', axis: 'y', extent: [50, 58] },
      t: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z'] },
      band: { type: 'bands', values: ['CHL'] },
    },
  },
  {
    type: 'Collection',
    stac_version: '1.0.0',
    stac_extensions: ['datacube'],
    id: 'oceancolour_med_chl_l4_nrt_observations_009_041',
    datasource_type: 'zarr-b0b066fa-2e7b-46fa-a409-9044765da723',
    title: 'OCEANCOLOUR_MED_CHL_L4_NRT_OBSERVATIONS_009_041',
    description: 'Some description',
    keywords: ['open data', 'sentinel hub', 'raster', 'race challenges', 'Copernicus service'],
    license: '',
    providers: [
      {
        name: 'Sentinel Hub',
        description: '',
        roles: ['processor'],
        url: 'services.sentinel-hub.com',
      },
    ],
    extent: {
      spatial: { bbox: [[5, 30, 20, 45]] },
      temporal: { interval: [['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z']] },
    },
    links: [
      {
        href: 'https://collections.eurodatacube.com//stac/cams_glc_2017.json',
        rel: 'self',
      },
      {
        href: '',
        rel: 'license',
      },
      {
        layer_name: 'CHL visualization',
        evalscript: evalscriptCHL,
        mosaicking_order: 'mostRecent',
        upsampling: 'BICUBIC',
        href: 'https://docs.sentinel-hub.com/api/latest/api/process/',
        rel: 'processing-expression',
      },
    ],
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [5, 20] },
      y: { type: 'spatial', axis: 'y', extent: [30, 45] },
      t: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z'] },
      band: { type: 'bands', values: ['CHL'] },
    },
  },
  {
    type: 'Collection',
    stac_version: '1.0.0',
    stac_extensions: ['datacube'],
    id: 'oceancolour_bs_chl_l4_nrt_observations_009_045',
    datasource_type: 'zarr-ff3bb75c-df26-4616-9a89-1f1b33f80d77',
    title: 'OCEANCOLOUR_BS_CHL_L4_NRT_OBSERVATIONS_009_045',
    description: 'Some description',
    keywords: ['open data', 'sentinel hub', 'raster', 'race challenges', 'Copernicus service'],
    license: '',
    providers: [
      {
        name: 'Sentinel Hub',
        description: '',
        roles: ['processor'],
        url: 'services.sentinel-hub.com',
      },
    ],
    extent: {
      spatial: { bbox: [[27, 40, 35, 48]] },
      temporal: { interval: [['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z']] },
    },
    links: [
      {
        href: 'https://collections.eurodatacube.com//stac/cams_glc_2017.json',
        rel: 'self',
      },
      {
        href: '',
        rel: 'license',
      },
      {
        layer_name: 'CHL visualization',
        evalscript: evalscriptCHL,
        mosaicking_order: 'mostRecent',
        upsampling: 'BICUBIC',
        href: 'https://docs.sentinel-hub.com/api/latest/api/process/',
        rel: 'processing-expression',
      },
    ],
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [27, 35] },
      y: { type: 'spatial', axis: 'y', extent: [40, 48] },
      t: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z'] },
      band: { type: 'bands', values: ['CHL'] },
    },
  },
  {
    type: 'Collection',
    stac_version: '1.0.0',
    stac_extensions: ['datacube'],
    id: 'oceancolour_med_optics_l3_nrt_observations_009_038',
    datasource_type: 'zarr-9bea3f4b-cc81-49cf-bb53-fa3cb7204745',
    title: 'OCEANCOLOUR_MED_OPTICS_L3_NRT_OBSERVATIONS_009_038',
    description: 'Some description',
    keywords: ['open data', 'sentinel hub', 'raster', 'race challenges', 'Copernicus service'],
    license: '',
    providers: [
      {
        name: 'Sentinel Hub',
        description: '',
        roles: ['processor'],
        url: 'services.sentinel-hub.com',
      },
    ],
    extent: {
      spatial: { bbox: [[0, 40, 10, 45]] },
      temporal: { interval: [['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z']] },
    },
    links: [
      {
        href: 'https://collections.eurodatacube.com//stac/cams_glc_2017.json',
        rel: 'self',
      },
      {
        href: '',
        rel: 'license',
      },
      {
        layer_name: 'KD490 visualization',
        evalscript: evalscriptKD490,
        mosaicking_order: 'mostRecent',
        upsampling: 'BICUBIC',
        href: 'https://docs.sentinel-hub.com/api/latest/api/process/',
        rel: 'processing-expression',
      },
    ],
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [0, 10] },
      y: { type: 'spatial', axis: 'y', extent: [40, 45] },
      t: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z'] },
      band: { type: 'bands', values: ['KD490'] },
    },
  },
];

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
    allCollections.push(...MOCKED_ZARR_COLLECTIONS);
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
          group: this._getGroupName(collection.title, collection.keywords),
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

  _getGroupName(name, tags) {
    return (
      EDC_PUBLIC_GROUPS.find((group) => name.match(group)) ||
      tags.find((t) => EDC_PUBLIC_GROUPS.includes(t)) ||
      'Miscellaneous'
    );
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
    console.warn('getAvailableDates disabled for Copernicus services.');
    if (collection.group === 'Copernicus service') {
      // Just temporary!
      return [];
    }
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
