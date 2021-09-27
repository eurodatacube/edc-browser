import axios from 'axios';
import wkx from 'wkx';
import { isCancelled } from '@sentinel-hub/sentinelhub-js';

import { convertGeoJSONCrs, convertBBox } from '../utils/coords';
import store, { visualizationSlice, errorsSlice, paginationSlice } from '../store';
import { MAXIMUM_GEOMETRY_SIZE_BYTES, MAX_GEODB_FEATURES } from '../const';

export default class GeoDBLayer {
  constructor({ database, collectionId, geodb_token }) {
    this.database = database;
    this.collectionId = collectionId;
    this.geodb_token = geodb_token;
    this.collectionSRID = null;
    this.fetchedTiles = [];
    this.fetchedDataIds = [];
    this.fetchedDataOffsets = {};
  }

  async getCollectionSRID(database, collectionId) {
    const { data } = await axios.post(
      'https://xcube-geodb.brockmann-consult.de/rpc/geodb_get_collection_srid',
      { collection: `${database}_${collectionId}` },
      this._getConfigWithAuth(),
    );
    return data[0]['src'][0]['srid'];
  }

  _getConfigWithAuth() {
    return { headers: { Authorization: `Bearer ${this.geodb_token}` } };
  }

  async getCollectionData(limit = 1) {
    const { data } = await axios.get(
      `https://xcube-geodb.brockmann-consult.de/${this.database}_${this.collectionId}?limit=${limit}`,
      this._getConfigWithAuth(),
    );
    return this.convertGeoDBData(data);
  }

  convertGeoDBData(data) {
    const keysToRemove = ['geometry'];
    return data.map((entry) => {
      const newEntry = {};
      let { geometry, id } = entry;
      geometry = wkx.Geometry.parse(Buffer.from(geometry, 'hex')).toGeoJSON();
      newEntry['geometry'] = geometry;
      newEntry['id'] = id;
      const newKeys = Object.keys(entry).filter((key) => !keysToRemove.includes(key));
      newEntry['properties'] = {};
      for (let key of newKeys) {
        newEntry['properties'][key] = isNaN(entry[key]) ? entry[key] : parseFloat(entry[key]);
      }
      return newEntry;
    });
  }

  isTileInsideOtherTile(tile1, tile2) {
    // Checks if tile1 is inside tile2
    const { x: x1, y: y1, z: z1 } = tile1;
    const { x: x2, y: y2, z: z2 } = tile2;
    if (z2 > z1) {
      return false;
    }
    const x1AtZ2 = Math.floor(x1 / Math.pow(2, z1 - z2));
    const y1AtZ2 = Math.floor(y1 / Math.pow(2, z1 - z2));
    if (x2 !== x1AtZ2 || y2 !== y1AtZ2) {
      return false;
    }
    return true;
  }

  hasDataAlreadyBeenFetched(tileCoords, tileId, maxGeoDBFeatures) {
    return (
      this.fetchedTiles.some((t) => this.isTileInsideOtherTile(tileCoords, t)) &&
      (this.fetchedDataOffsets[tileId] === null || this.fetchedDataOffsets[tileId] >= maxGeoDBFeatures)
    );
  }

  anyTileHasMore() {
    for (let tileId in this.fetchedDataOffsets) {
      if (this.fetchedDataOffsets[tileId] !== null) {
        return true;
      }
    }
  }

  async getMap(params, _, reqConfig) {
    const { bbox, tileId, tileCoords, maxGeoDBFeatures = MAX_GEODB_FEATURES } = params;
    const { cancelToken } = reqConfig;

    if (!this.anyTileHasMore()) {
      store.dispatch(paginationSlice.actions.setHasMore(false));
    }

    if (this.hasDataAlreadyBeenFetched(tileCoords, tileId, maxGeoDBFeatures)) {
      return;
    }

    const fullId = `${this.database}_${this.collectionId}`;

    let srid = this.collectionSRID;
    if (srid === null) {
      srid = await this.getCollectionSRID(this.database, this.collectionId);
      this.collectionSRID = srid;
    }

    const [minx, miny, maxx, maxy] = convertBBox(bbox, srid);

    let offset = this.fetchedDataOffsets[tileId] || 0;
    let limit = Math.min(maxGeoDBFeatures - offset, 100);
    let data = [];
    let largestChunkSize = 0;

    const requestConfig = this._getConfigWithAuth();
    requestConfig.cancelToken = cancelToken.token;

    while (true) {
      try {
        let { data: dataChunk } = await axios.post(
          'https://xcube-geodb.brockmann-consult.de/rpc/geodb_get_by_bbox',
          {
            collection: fullId,
            minx: minx,
            miny: miny,
            maxx: maxx,
            maxy: maxy,
            bbox_crs: srid,
            limit: limit,
            bbox_mode: 'intersects',
            where: 'id>-1',
            op: 'AND',
            offset: offset,
          },
          requestConfig,
        );
        dataChunk = dataChunk[0]['src'] || [];

        data = [...data, ...dataChunk];

        if (dataChunk.length < limit) {
          this.fetchedDataOffsets[tileId] = null;
          break;
        }

        const chunkSize = JSON.stringify(dataChunk).length;

        offset += dataChunk.length;

        if (chunkSize > largestChunkSize) {
          limit = Math.min(Math.ceil(limit * (10000000 / chunkSize)), maxGeoDBFeatures - offset);
          largestChunkSize = chunkSize;
        }

        if (offset >= maxGeoDBFeatures) {
          this.fetchedDataOffsets[tileId] = offset;
          store.dispatch(paginationSlice.actions.setHasMore(true));
          break;
        }
      } catch (err) {
        if (!isCancelled(err)) {
          console.log(tileId, 'failed with err ', err);
        }
        return;
      }
    }

    data = data.filter((e) => {
      if (e.geometry.length > MAXIMUM_GEOMETRY_SIZE_BYTES) {
        console.warn(
          `Geometry for entry ${e.id} was omitted, as it exceeds maximum supported size of ${MAXIMUM_GEOMETRY_SIZE_BYTES} bytes.`,
        );
        store.dispatch(
          errorsSlice.actions.addError({
            text: `Geometry for entry ${e.id} was omitted, as it exceeds maximum supported size of ${MAXIMUM_GEOMETRY_SIZE_BYTES} bytes.`,
          }),
        );
        return false;
      }
      return true;
    });

    data = this.convertGeoDBData(data);

    data = data.map((e) => ({
      tileId: tileId,
      id: e.id,
      geometry: convertGeoJSONCrs(e.geometry, srid, 4326),
      properties: e.properties,
    }));

    data = data.filter((d) => {
      if (this.fetchedDataIds.includes(d.id)) {
        return false;
      }
      this.fetchedDataIds.push(d.id);
      return true;
    });

    store.dispatch(paginationSlice.actions.addFetched(data.length));
    store.dispatch(visualizationSlice.actions.addDataGeometries(data));
    this.fetchedTiles.push(tileCoords);
    return null;
  }
}
