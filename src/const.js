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
  DATA_PANEL: 0,
  ON_DEMAND_DATA_PANEL: 1,
};

export const EDC_DATA_TAB = {
  PUBLIC: 0,
  COMMERCIAL: 1,
  USER: 2,
};

export const USER_DATA_TAB = {
  SHARED: 0,
  PRIVATE: 1,
};

export const ALGORITHM_TYPES = {
  bbox: 'bbox',
  daterange: 'daterange',
  stringlist: 'stringlist',
  date: 'date',
};

export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

// SH services have a limit for a max image size of 2500px*2500px
export const MAX_SH_IMAGE_SIZE = 2500;

export const DEFAULT_FROM_TIME = moment.utc('1970-01-01');
export const DEFAULT_TO_TIME = moment.utc();

export const DEFAULT_TIMEOUT = 10000;

export const MAXIMUM_GEOMETRY_SIZE_BYTES = 10000000;

export const AOI_SHAPE = {
  polygon: 'Polygon',
  rectangle: 'Rectangle',
};

export const MAX_GEODB_FEATURES = 20000;

export const EDC_PUBLIC_GROUPS = ['Sentinel', 'Landsat', 'ICEYE', 'DEM', 'ALOS', 'Copernicus services'];

export const DEFAULT_EDC_PUBLIC_GROUP = EDC_PUBLIC_GROUPS[0];

export const MINIMUM_GEOMETRY_SIZE_TO_RENDER_OWN_LAYER = 1000000;

export const MAX_DESCRIPTION_LENGTH_IN_CHARS = 800;
