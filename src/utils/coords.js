import proj4 from 'proj4';
import crsDefs from 'epsg-index/all.json';
import { coordEach } from '@turf/meta';

export function convertGeoJSONCrs(geojson, srid, toSrid = null) {
  if (!crsDefs[srid]) {
    throw new Error(`Error converting GeoJSON: CRS ${srid} not supported!`);
  }
  let toProj = 'EPSG:3857';
  if (toSrid) {
    toProj = crsDefs[toSrid].proj4;
  }
  const transform = proj4(crsDefs[srid].proj4, toProj);
  coordEach(geojson, (coord, index) => {
    const [x, y] = transform.forward(coord);
    coord[0] = x;
    coord[1] = y;
  });
  return geojson;
}

export function convertBBox(bbox, srid) {
  if (!crsDefs[srid]) {
    throw new Error(`Error converting bbox: CRS ${srid} not supported!`);
  }
  const { minX, maxX, minY, maxY, crs } = bbox;
  const fromProjection = crsDefs[crs.srid].proj4;
  const toProjection = crsDefs[srid].proj4;
  const transform = proj4(fromProjection, toProjection);
  return [...transform.forward([minX, minY]), ...transform.forward([maxX, maxY])];
}

export function wgs84ToMercator({ lat, lng }) {
  let toSrid = 'EPSG:3857';
  const toProj = crsDefs[toSrid].proj4;
  return proj4(toProj, [lng, lat]);
}

//calculate zoom level for leaflet bounds
export function getBoundsZoomLevel(bounds) {
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 21;

  function latRad(lat) {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx, worldPx, fraction) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

  const lngDiff = ne.lng - sw.lng;
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

  const latZoom = zoom(window.innerHeight, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(window.innerWidth, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

export function createPolygonFromBBox(bbox) {
  const [minX, minY, maxX, maxY] = bbox;
  return {
    type: 'Polygon',
    coordinates: [
      [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
        [minX, minY],
      ],
    ],
  };
}
