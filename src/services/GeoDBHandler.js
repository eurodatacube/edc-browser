import axios from 'axios';
import wkx from 'wkx';

import { parseJwt } from '../utils/jwt';
import AbstractServiceHandler from './AbstractServiceHandler';
import { collectionFactory } from './collection';
import { COLLECTION_TYPE, DEFAULT_TIMEOUT } from '../const';
import { convertGeoJSONCrs } from '../utils/coords';
import { requestWithTimeout } from '../utils';
import { getBoundsAndLatLng } from '../components/EdcDataPanel/CommercialDataPanel/commercialData.utils';
import GeoDBLayer from './GeoDBLayer';

export default class GeoDBHandler extends AbstractServiceHandler {
  HANDLER_ID = 'GEO_DB';

  constructor(params) {
    super();
    const { GEO_DB_CLIENT_ID, GEO_DB_CLIENT_SECRET } = params;
    this.GEO_DB_CLIENT_ID = GEO_DB_CLIENT_ID;
    this.GEO_DB_CLIENT_SECRET = GEO_DB_CLIENT_SECRET;

    this.GEO_DB_BASE_URL = 'https://xcube-users.brockmann-consult.de';
    this.geodb_token = null;
    this.geoserverInstances = [];
    this.collectionSRID = {};
    this.geoDBLayer = null;
  }

  async authenticate() {
    const TOKEN_REQUEST_OPTIONS = {
      grant_type: 'client_credentials',
      client_secret: this.GEO_DB_CLIENT_SECRET,
      client_id: this.GEO_DB_CLIENT_ID,
      audience: 'https://xcube-geodb.brockmann-consult.de',
    };
    const { data } = await requestWithTimeout(
      (cancelToken) =>
        axios
          .post(this.GEO_DB_BASE_URL + '/api/v2/oauth/token', TOKEN_REQUEST_OPTIONS, {
            cancelToken: cancelToken,
          })
          .catch((err) => {
            console.error(err);
            throw new Error('GeoDB authentication failed.');
          }),
      DEFAULT_TIMEOUT,
    );
    this.geodb_token = data.access_token;
  }

  get getUserId() {
    if (!this.geodb_token) {
      throw new Error('No auth token');
    }
    const parsedToken = parseJwt(this.geodb_token);
    return parsedToken['https://geodb.brockmann-consult.de/dbrole'];
  }

  async getCollections() {
    if (!this.geodb_token) {
      throw new Error('Fetching GeoDB collections failed.');
    }

    const userId = this.getUserId;
    const { data } = await requestWithTimeout(
      (cancelToken) =>
        axios
          .post('https://xcube-geodb.brockmann-consult.de/rpc/geodb_get_my_collections', null, {
            cancelToken: cancelToken,
            ...this._getConfigWithAuth(),
          })
          .catch((err) => {
            console.error(err);
            throw new Error('Fetching GeoDB collections failed.');
          }),
      DEFAULT_TIMEOUT,
    );

    return {
      user: data[0].src.map((collection) =>
        collectionFactory({
          uniqueId: `${collection.database}-${collection.collection}`,
          id: collection.collection,
          type: COLLECTION_TYPE.GEO_DB,
          title: collection.collection,
          group: collection.database,
          ownedByUser: collection.owner === userId,
        }),
      ),
    };
  }

  _getConfigWithAuth() {
    return { headers: { Authorization: `Bearer ${this.geodb_token}` } };
  }

  async getCollectionData(database, collectionId, limit = 1) {
    const { data } = await axios.get(
      `https://xcube-geodb.brockmann-consult.de/${database}_${collectionId}?limit=${limit}`,
      this._getConfigWithAuth(),
    );
    return this.convertGeoDBData(data);
  }

  convertGeoDBData(data) {
    const keysToRemove = ['id', 'created_at', 'modified_at', 'status', 'geometry'];
    return data.map((entry) => {
      const newEntry = {};
      let { geometry } = entry;
      geometry = wkx.Geometry.parse(Buffer.from(geometry, 'hex')).toGeoJSON();
      newEntry['geometry'] = geometry;
      const newKeys = Object.keys(entry).filter((key) => !keysToRemove.includes(key));
      for (let key of newKeys) {
        newEntry[key] = isNaN(entry[key]) ? entry[key] : parseFloat(entry[key]);
      }
      return newEntry;
    });
  }

  async getCollectionSRID(database, collectionId) {
    const { data } = await axios.post(
      'https://xcube-geodb.brockmann-consult.de/rpc/geodb_get_collection_srid',
      { collection: `${database}_${collectionId}` },
      this._getConfigWithAuth(),
    );
    return data[0]['src'][0]['srid'];
  }

  async getConfigurations(database, collectionId) {
    return [];
  }

  async getBestInitialLocation(database, collectionId) {
    const srid = await this.getCollectionSRID(database, collectionId);
    const data = await this.getCollectionData(database, collectionId, 1);
    const geometry = data.map((d) => convertGeoJSONCrs(d.geometry, srid, 4326));
    const { lat, lng, zoom } = getBoundsAndLatLng(geometry);
    return { lat: lat, lng: lng, zoom: zoom };
  }

  getLayer(database, collectionId) {
    if (
      this.geoDBLayer === null ||
      this.geoDBLayer.database !== database ||
      this.geoDBLayer.collectionId !== collectionId
    ) {
      this.geoDBLayer = new GeoDBLayer({
        database: database,
        collectionId: collectionId,
        geodb_token: this.geodb_token,
      });
    }
    return this.geoDBLayer;
  }
}
