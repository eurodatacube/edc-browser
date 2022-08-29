import moment from 'moment';

import store, { mainMapSlice, visualizationSlice, tabsSlice, algorithmsSlice } from '../store';
import { DEFAULT_LAT_LNG, PANEL_TAB } from '../const';
import { b64EncodeUnicode, b64DecodeUnicode } from './base64MDN';

import { translatedCollectionIds } from './translatedCollectionIds';

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
    algorithm,
    selectedTabIndex,
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
    params.evalscript = b64EncodeUnicode(evalscript);
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
  if (algorithm && selectedTabIndex === PANEL_TAB.ON_DEMAND_DATA_PANEL) {
    params.algorithm = algorithm;
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
    algorithm,
  } = params;

  let { lat: parsedLat, lng: parsedLng, zoom: parsedZoom } = parsePosition(lat, lng, zoom);

  if (parsedLat > 90 || parsedLat < -90 || parsedLng > 180 || parsedLng < -180) {
    parsedLng = DEFAULT_LAT_LNG.lng;
    parsedLat = DEFAULT_LAT_LNG.lat;
  }
  store.dispatch(mainMapSlice.actions.setPosition({ zoom: parsedZoom, lat: parsedLat, lng: parsedLng }));

  // backward compatibility: evalscript in URL was not always base64 encoded
  let decodedEvalscript = undefined;
  if (evalscript) {
    try {
      atob(evalscript); // b64DecodeUnicode doesn't fail if evalscript is already raw
      decodedEvalscript = b64DecodeUnicode(evalscript);
    } catch (e) {
      decodedEvalscript = evalscript;
    }
  }

  // backward compatibility: some collection ids in EDC public collection changed
  let correctCollectionId = getTranslatedCollectionId(params.collectionId);

  const newVisualizationParams = {
    collectionId: correctCollectionId,
    layerId: layerId,
    customVisualizationSelected: customVisualizationSelected,
    evalscript: decodedEvalscript,
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
  if (algorithm) {
    store.dispatch(algorithmsSlice.actions.setSelectedAlgorithm(algorithm));
    store.dispatch(tabsSlice.actions.setMainTabIndex(PANEL_TAB.ON_DEMAND_DATA_PANEL));
  }
}

function getTranslatedCollectionId(collectionId) {
  const newCollectionId = translatedCollectionIds[collectionId];
  return newCollectionId ? newCollectionId : collectionId;
}
