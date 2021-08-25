import { MapLayer, withLeaflet } from 'react-leaflet';

import { MapView } from '@deck.gl/core';
import { LeafletLayer } from 'deck.gl-leaflet';

class DeckGlOverlayLayer extends MapLayer {
  createLeafletElement({ layers = [] }) {
    this.instance = new LeafletLayer({
      views: [
        new MapView({
          repeat: true,
        }),
      ],
      layers: layers,
    });
    return this.instance;
  }

  updateLeafletElement(fromProps, toProps) {
    this.instance.setProps(toProps);
  }
}
export default withLeaflet(DeckGlOverlayLayer);
