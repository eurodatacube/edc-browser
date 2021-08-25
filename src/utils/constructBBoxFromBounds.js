import { CRS_EPSG4326, CRS_EPSG3857, BBox } from '@sentinel-hub/sentinelhub-js';
import { wgs84ToMercator } from './coords';

export function constructBBoxFromBounds(bounds, crs = CRS_EPSG4326.authId) {
  if (crs === CRS_EPSG4326.authId) {
    return new BBox(CRS_EPSG4326, bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
  }
  if (crs === CRS_EPSG3857.authId) {
    const { x: maxX, y: maxY } = wgs84ToMercator(bounds.getNorthEast());
    const { x: minX, y: minY } = wgs84ToMercator(bounds.getSouthWest());
    return new BBox(CRS_EPSG3857, minX, minY, maxX, maxY);
  }
}
