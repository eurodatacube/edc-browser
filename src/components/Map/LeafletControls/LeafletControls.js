import React from 'react';
import { ZoomControl, ScaleControl, AttributionControl } from 'react-leaflet';

import MouseCoordsControl from './MouseCoordsControl/MouseCoordsControl';
import './LeafletControls.scss';

export default class LeafletControls extends React.Component {
  render() {
    return (
      <>
        <AttributionControl position="bottomleft" />
        <MouseCoordsControl position="bottomright" />
        <ScaleControl position="bottomright" imperial={false} />
        <ZoomControl zoomInTitle={`Zoom in`} zoomOutTitle={`Zoom out`} position="bottomright" />
      </>
    );
  }
}
