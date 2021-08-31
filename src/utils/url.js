import moment from 'moment';

import store, { mainMapSlice, visualizationSlice, tabsSlice } from '../store';
import { DEFAULT_LAT_LNG, PANEL_TAB } from '../const';

export function updatePath(props) {
  let {
    lat,
    lng,
    zoom,
    fromTime,
    toTime,
    collectionId,
    layerId,
    customVisualizationSelected,
    evalscript,
    evalscriptUrl,
    type,
  } = props;
  lat = Math.round(100000 * lat) / 100000;
  lng = Math.round(100000 * lng) / 100000;

  let params = {
    zoom: zoom,
    lat: lat,
    lng: lng,
  };

  if (collectionId) {
    params.collectionId = collectionId;
  }
  if (layerId) {
    params.layerId = layerId;
  }
  if (customVisualizationSelected) {
    params.customVisualizationSelected = customVisualizationSelected;
  }
  if (evalscript) {
    params.evalscript = evalscript;
  }
  if (evalscriptUrl) {
    params.evalscriptUrl = evalscriptUrl;
  }
  if (type) {
    params.type = type;
  }
  if (fromTime) {
    params.fromTime = fromTime.toISOString();
  }
  if (toTime) {
    params.toTime = toTime.toISOString();
  }

  const escapedParams = Object.keys(params)
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');

  const newUrl =
    window.location.origin + window.location.pathname + '?' + escapedParams + window.location.hash;

  window.history.pushState({}, '', newUrl);
}

function parsePosition(lat, lng, zoom) {
  zoom = isNaN(parseInt(zoom)) ? undefined : parseInt(zoom);
  lat = isNaN(parseFloat(lat)) ? undefined : parseFloat(lat);
  lng = isNaN(parseFloat(lng)) ? undefined : parseFloat(lng);
  return { lat, lng, zoom };
}

export function getUrlParams() {
  const urlParamString = window.location.search.length > 0 ? window.location.search : window.location.hash;
  const searchParams = new URLSearchParams(urlParamString);
  return Object.fromEntries(searchParams.entries());
}

export function setStore(params) {
  const {
    zoom,
    lat,
    lng,
    fromTime,
    toTime,
    collectionId,
    layerId,
    customVisualizationSelected,
    evalscript,
    evalscriptUrl,
    type,
  } = params;

  let { lat: parsedLat, lng: parsedLng, zoom: parsedZoom } = parsePosition(lat, lng, zoom);

  if (parsedLat > 90 || parsedLat < -90 || parsedLng > 180 || parsedLng < -180) {
    parsedLng = DEFAULT_LAT_LNG.lng;
    parsedLat = DEFAULT_LAT_LNG.lat;
  }
  store.dispatch(mainMapSlice.actions.setPosition({ zoom: parsedZoom, lat: parsedLat, lng: parsedLng }));
  const newVisualizationParams = {
    collectionId: collectionId,
    layerId: layerId,
    customVisualizationSelected: customVisualizationSelected,
    evalscript: evalscript,
    evalscriptUrl: evalscriptUrl,
    type: type,
  };
  if (fromTime) {
    newVisualizationParams.fromTime = moment.utc(fromTime);
  }
  if (toTime) {
    newVisualizationParams.toTime = moment.utc(toTime);
  }
  store.dispatch(visualizationSlice.actions.setVisualizationParams(newVisualizationParams));

  if (collectionId) {
    store.dispatch(tabsSlice.actions.setMainTabIndex(PANEL_TAB.DATA_PANEL));
  }
}
