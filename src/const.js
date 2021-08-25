import moment from 'moment';

export const DEFAULT_LAT_LNG = {
  lat: 41.9,
  lng: 12.5,
};

export const SUPPORTED_AOI_FORMATS = ['kmz', 'kml', 'gpx', 'geojson'];

export const COLLECTION_TYPE = {
  SENTINEL_HUB_EDC: 'sentinel-hub-edc',
  SENTINEL_HUB: 'sentinel-hub',
  GEO_DB: 'geodb',
};

export const PANEL_TAB = {
  ALGORITHMS: 0,
  DATA_PANEL: 1,
};

export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

// SH services have a limit for a max image size of 2500px*2500px
export const MAX_SH_IMAGE_SIZE = 2500;

export const DEFAULT_FROM_TIME = moment.utc('1970-01-01');
export const DEFAULT_TO_TIME = moment.utc();

export const DEFAULT_TIMEOUT = 20000;
