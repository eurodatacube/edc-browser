import L from 'leaflet';
import { GridLayer, withLeaflet } from 'react-leaflet';
import { ApiType, BBox, CRS_EPSG3857, MimeTypes, CancelToken } from '@sentinel-hub/sentinelhub-js';
import isEqual from 'fast-deep-equal';

import { LayersFactory } from '../../../services/layersFactory';

class VisualizationLayer extends L.TileLayer {
  constructor(options) {
    super(options);
    const defaultOptions = {
      tileSize: 512,
      format: MimeTypes.JPEG,
      preview: 2,
      transparent: true,
    };
    const { collection, layerId } = options;

    this.layer = LayersFactory(collection, layerId);

    const mergedOptions = Object.assign(defaultOptions, options);
    L.setOptions(this, mergedOptions);
  }

  onAdd = (map) => {
    this._initContainer();
    this._crs = this.options.crs || map.options.crs;

    L.TileLayer.prototype.onAdd.call(this, map);
    map.on('move', this.updateClipping, this);
    this.updateClipping();
  };

  updateClipping = () => {
    if (!this._map || !this.clipping) return this;

    const [a, b] = this.clipping;
    const { min, max } = this._map.getPixelBounds();
    let p = { x: a * (max.x - min.x), y: 0 };
    let q = { x: b * (max.x - min.x), y: max.y - min.y };

    p = this._map.containerPointToLayerPoint(p);
    q = this._map.containerPointToLayerPoint(q);

    let e = this.getContainer();
    e.style['overflow'] = 'hidden';
    e.style['left'] = p.x + 'px';
    e.style['top'] = p.y + 'px';
    e.style['width'] = q.x - p.x + 'px';
    e.style['height'] = q.y - p.y + 'px';
    for (let f = e.firstChild; f; f = f.nextSibling) {
      if (f.style) {
        f.style['margin-top'] = -p.y + 'px';
        f.style['margin-left'] = -p.x + 'px';
      }
    }
  };

  createTile = (coords, done) => {
    const tile = L.DomUtil.create('img', 'leaflet-tile');
    tile.width = this.options.tileSize;
    tile.height = this.options.tileSize;
    const tileId = `${coords.x}_${coords.y}_${coords.z}`;
    tile.tileId = tileId;
    const cancelToken = new CancelToken();
    tile.cancelToken = cancelToken;
    const tileSize = this.options.tileSize;
    const nwPoint = coords.multiplyBy(tileSize);
    const sePoint = nwPoint.add([tileSize, tileSize]);
    const nw = L.CRS.EPSG3857.project(this._map.unproject(nwPoint, coords.z));
    const se = L.CRS.EPSG3857.project(this._map.unproject(sePoint, coords.z));
    const bbox = new BBox(CRS_EPSG3857, nw.x, se.y, se.x, nw.y);

    const individualTileParams = {
      ...this.options,
      width: tileSize,
      height: tileSize,
      tileId: tileId,
      tileCoords: coords,
    };
    individualTileParams.bbox = bbox;

    let reqConfig = { cancelToken: cancelToken };
    const apiType =
      this.layer.supportsApiType && this.layer.supportsApiType(ApiType.PROCESSING)
        ? ApiType.PROCESSING
        : ApiType.WMS;
    this.layer.getMap(individualTileParams, apiType, reqConfig).then((blob) => {
      tile.onload = function () {
        URL.revokeObjectURL(tile.src);
        done(null, tile);
      };
      if (blob) {
        const objectURL = URL.createObjectURL(blob);
        tile.src = objectURL;
      }
    });
    return tile;
  };

  setParams = (params) => {
    this.options = Object.assign(this.options, params);

    const { collection, layerId } = this.options;
    this.layer = LayersFactory(collection, layerId);

    this.redraw();
  };

  setClipping = (clipping) => {
    this.clipping = clipping;
    this.updateClipping();
  };
}

class VisualizationLayerComponent extends GridLayer {
  createLeafletElement(props) {
    const { progress, ...params } = props;
    const { leaflet: _l, ...options } = this.getOptions(params);
    const layer = new VisualizationLayer(options);

    layer.on('tileunload', function (e) {
      e.tile.cancelToken.cancel();
    });

    return layer;
  }

  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    const { ...prevProps } = fromProps;
    const { ...prevParams } = this.getOptions(prevProps);
    const { ...props } = toProps;
    const { ...params } = this.getOptions(props);

    if (!isEqual(params, prevParams)) {
      this.leafletElement.setParams(params);
    }
  }

  getOptions(params) {
    let options = {};

    if (params.collection) {
      options.collection = params.collection;
    }
    if (params.layerId) {
      options.layerId = params.layerId;
    }
    if (params.fromTime) {
      options.fromTime = params.fromTime;
    }
    if (params.toTime) {
      options.toTime = params.toTime;
    }
    if (params.pane || params.leaflet.pane) {
      options.pane = params.pane || params.leaflet.pane;
    }
    return options;
  }
}
export default withLeaflet(VisualizationLayerComponent);
