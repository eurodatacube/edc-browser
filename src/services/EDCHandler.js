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
    id: 'oceancolour-bal-chl-l3-nrt-observations-009-049',
    datasource_type: 'zarr-4d342a5c-d446-4625-9217-d7e87260eecf',
    title: 'OCEANCOLOUR_BAL_CHL_L3_NRT_OBSERVATIONS_009_049',
    description:
      'OCEANCOLOUR_BAL_CHL_L3_NRT_OBSERVATIONS_009_049 is one of the ocean products provided by [Copernicus Marine Environment Monitoring Service (CMEMS)](https://marine.copernicus.eu/). This product is delivered as daily NRT, L3 chlorophyll-a product of 0.3km resolution over the Baltic Sea, based on the OLCI single sensor product.',
    keywords: ['open data', 'sentinel hub', 'raster', 'race challenges', 'Copernicus services'],
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
        href: 'https://collections.eurodatacube.com/oceancolour-bal-chl-l3-nrt-observations-009-049/',
        rel: 'about',
        type: 'text/html',
        title: 'Website describing the collection',
      },
      {
        href: '',
        rel: 'license',
      },
      {
        href: 'https://docs.sentinel-hub.com/api/latest/api/process/',
        rel: 'about',
        type: 'text/html',
        title: 'Details about running Evalscripts',
      },
      {
        evalscript: evalscriptCHL,
        rel: 'processing-expression',
        type: 'application/javascript',
        title: 'Evalscript to generate CHL visualization imagery',
        'sentinelhub:layer_name': 'CHL visualization',
        'sentinelhub:mosaicking_order': 'mostRecent',
        'sentinelhub:upsampling': 'BICUBIC',
      },
    ],
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [18, 20] },
      y: { type: 'spatial', axis: 'y', extent: [58, 60] },
      t: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z'] },
      bands: { type: 'bands', values: ['CHL'] },
    },
  },
  {
    type: 'Collection',
    stac_version: '1.0.0',
    stac_extensions: ['datacube'],
    id: 'oceancolour-atl-chl-l4-nrt-observations-009-037',
    datasource_type: 'zarr-fc8c2b6d-56e4-41de-8116-d20c211ffa53',
    title: 'OCEANCOLOUR_ATL_CHL_L4_NRT_OBSERVATIONS_009_037',
    description:
      'OCEANCOLOUR_ATL_CHL_L4_NRT_OBSERVATIONS_009_037 is one of the ocean products provided by [Copernicus Marine Environment Monitoring Service (CMEMS)](https://marine.copernicus.eu/). This product is delivered as daily NRT, L4 chlorophyll-a product of 1km resolution over the Atlantic, based on the merging of the sensors SeaWiFS, MODIS, MERIS, VIIRS-SNPP&JPSS1, OLCI-S3A&S3B. \nL4 products are also called cloud free products, and are generated by applying space-time interpolation methods to fill in missing data values. NRT products are operationally produced daily, one day after satellite acquisition providing the best estimate of the ocean colour variables at the time of processing and after a few days superseded by Delayed Time (DT) files as soon as they are available to provide better quality.',
    keywords: ['open data', 'sentinel hub', 'raster', 'race challenges', 'Copernicus services'],
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
        href: 'https://collections.eurodatacube.com/oceancolour-atl-chl-l4-nrt-observations-009-037/',
        rel: 'about',
        type: 'text/html',
        title: 'Website describing the collection',
      },
      {
        href: '',
        rel: 'license',
      },
      {
        href: 'https://docs.sentinel-hub.com/api/latest/api/process/',
        rel: 'about',
        type: 'text/html',
        title: 'Details about running Evalscripts',
      },
      {
        evalscript: evalscriptCHL,
        rel: 'processing-expression',
        type: 'application/javascript',
        title: 'Evalscript to generate CHL visualization imagery',
        'sentinelhub:layer_name': 'CHL visualization',
        'sentinelhub:mosaicking_order': 'mostRecent',
        'sentinelhub:upsampling': 'BICUBIC',
      },
    ],
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [-8, 0] },
      y: { type: 'spatial', axis: 'y', extent: [50, 58] },
      t: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z'] },
      bands: { type: 'bands', values: ['CHL'] },
    },
  },
  {
    type: 'Collection',
    stac_version: '1.0.0',
    stac_extensions: ['datacube'],
    id: 'oceancolour-med-chl-l4-nrt-observations-009-041',
    datasource_type: 'zarr-5032fc41-79a3-4939-b313-7a75487a22ce',
    title: 'OCEANCOLOUR_MED_CHL_L4_NRT_OBSERVATIONS_009_041',
    description:
      'OCEANCOLOUR_MED_CHL_L4_NRT_OBSERVATIONS_009_041 is one of the ocean products provided by [Copernicus Marine Environment Monitoring Service (CMEMS)](https://marine.copernicus.eu/). This product is delivered as daily-interpolated NRT, L4 chlorophyll-a product of 0.3km resolution over the Mediterranean Sea, based on the merging of the sensors MODIS-AQUA, NOAA20-VIIRS, NPP-VIIRS and Sentinel3A-OLCI.',
    keywords: ['open data', 'sentinel hub', 'raster', 'race challenges', 'Copernicus services'],
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
        href: 'https://collections.eurodatacube.com/oceancolour-med-chl-l4-nrt-observations-009-041/',
        rel: 'about',
        type: 'text/html',
        title: 'Website describing the collection',
      },
      {
        href: '',
        rel: 'license',
      },
      {
        href: 'https://docs.sentinel-hub.com/api/latest/api/process/',
        rel: 'about',
        type: 'text/html',
        title: 'Details about running Evalscripts',
      },
      {
        evalscript: evalscriptCHL,
        rel: 'processing-expression',
        type: 'application/javascript',
        title: 'Evalscript to generate CHL visualization imagery',
        'sentinelhub:layer_name': 'CHL visualization',
        'sentinelhub:mosaicking_order': 'mostRecent',
        'sentinelhub:upsampling': 'BICUBIC',
      },
    ],
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [5, 20] },
      y: { type: 'spatial', axis: 'y', extent: [30, 45] },
      t: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z'] },
      bands: { type: 'bands', values: ['CHL'] },
    },
  },
  {
    type: 'Collection',
    stac_version: '1.0.0',
    stac_extensions: ['datacube'],
    id: 'oceancolour-bs-chl-l4-nrt-observations-009-045',
    datasource_type: 'zarr-a609c3f8-6ebf-4548-a449-af3a0779e697',
    title: 'OCEANCOLOUR_BS_CHL_L4_NRT_OBSERVATIONS_009_045',
    description:
      'OCEANCOLOUR_BS_CHL_L4_NRT_OBSERVATIONS_009_045 is one of the ocean products provided by [Copernicus Marine Environment Monitoring Service (CMEMS)](https://marine.copernicus.eu/). This product is delivered as daily-interpolated NRT, L4 chlorophyll-a product of 0.3km resolution over the Black Sea, based on the merging of the sensors MODIS-Aqua, NOAA-20 VIIRS, NPP-VIIRS, Sentinel3A-OLCI.',
    keywords: ['open data', 'sentinel hub', 'raster', 'race challenges', 'Copernicus services'],
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
        href: 'https://collections.eurodatacube.com/oceancolour-bs-chl-l4-nrt-observations-009-045/',
        rel: 'about',
        type: 'text/html',
        title: 'Website describing the collection',
      },
      {
        href: '',
        rel: 'license',
      },
      {
        href: 'https://docs.sentinel-hub.com/api/latest/api/process/',
        rel: 'about',
        type: 'text/html',
        title: 'Details about running Evalscripts',
      },
      {
        evalscript: evalscriptCHL,
        rel: 'processing-expression',
        type: 'application/javascript',
        title: 'Evalscript to generate CHL visualization imagery',
        'sentinelhub:layer_name': 'CHL visualization',
        'sentinelhub:mosaicking_order': 'mostRecent',
        'sentinelhub:upsampling': 'BICUBIC',
      },
    ],
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [27, 35] },
      y: { type: 'spatial', axis: 'y', extent: [40, 48] },
      t: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z'] },
      bands: { type: 'bands', values: ['CHL'] },
    },
  },
  {
    type: 'Collection',
    stac_version: '1.0.0',
    stac_extensions: ['datacube'],
    id: 'oceancolour-med-optics-l3-nrt-observations-009-038',
    datasource_type: 'zarr-254ff5ba-266c-4444-b019-092430f3ec04',
    title: 'OCEANCOLOUR_MED_OPTICS_L3_NRT_OBSERVATIONS_009_038',
    description:
      'OCEANCOLOUR_MED_OPTICS_L3_NRT_OBSERVATIONS_009_038 is one of the ocean products provided by [Copernicus Marine Environment Monitoring Service (CMEMS)](https://marine.copernicus.eu/). This product is delivered as daily-interpolated NRT, L3 diffuse attenuation coefficient of light at 490 nm (kd490) product of 0.3km resolution over the Mediterranean Sea, based on the merging of the sensors MODIS-AQUA, NOAA20-VIIRS, NPP-VIIRS and Sentinel3A-OLCI.',
    keywords: ['open data', 'sentinel hub', 'raster', 'race challenges', 'Copernicus services'],
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
        href: 'https://collections.eurodatacube.com/oceancolour-med-optics-l3-nrt-observations-009-038/',
        rel: 'about',
        type: 'text/html',
        title: 'Website describing the collection',
      },
      {
        href: '',
        rel: 'license',
      },
      {
        href: 'https://docs.sentinel-hub.com/api/latest/api/process/',
        rel: 'about',
        type: 'text/html',
        title: 'Details about running Evalscripts',
      },
      {
        evalscript: evalscriptKD490,
        rel: 'processing-expression',
        type: 'application/javascript',
        title: 'Evalscript to generate KD490 visualization imagery',
        'sentinelhub:layer_name': 'KD490 visualization',
        'sentinelhub:mosaicking_order': 'mostRecent',
        'sentinelhub:upsampling': 'BICUBIC',
      },
    ],
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [0, 10] },
      y: { type: 'spatial', axis: 'y', extent: [40, 45] },
      t: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2021-12-31T00:00:00Z'] },
      bands: { type: 'bands', values: ['KD490'] },
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
    const parseDescription = (desc) => {
      if (!desc.includes('```')) {
        return desc.replace(/\r?\n|\r/g, ' ');
      }

      const splitDesc = desc.split('```');
      let parsedDesc = '';
      for (let i = 0; i < splitDesc.length; i++) {
        parsedDesc += i % 2 === 0 ? splitDesc[i].replace(/\r?\n|\r/g, ' ') : `\n\`\`\`${splitDesc[i]}\`\`\``;
      }
      return parsedDesc;
    };

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
          extendedInformationLink: collection.links.filter(
            (l) => l.rel === 'about' && l.title === 'Website describing the collection',
          )[0]?.href,
          description: parseDescription(collection.description),
          bands: collection['cube:dimensions'].bands.values,
          temporalExtent: collection.extent.temporal,
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

    if (!host.startsWith('https://')) {
      host = 'https://' + host;
    }
    if (!host.endsWith('/')) {
      host += '/';
    }

    return Object.keys(SHV3_LOCATIONS_ROOT_URL).find((key) => {
      return SHV3_LOCATIONS_ROOT_URL[key] === host;
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

  async getAvailableDates(collection, bounds, fromTime, toTime, isFlyover = false) {
    console.warn('getAvailableDates disabled for Copernicus services.');
    if (collection.group === 'Copernicus services') {
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
      if (isFlyover) {
        return await searchLayer.findFlyovers(bbox, fromTime, toTime);
      }
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
