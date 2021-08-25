import React, { useMemo, useState } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

import { withLeaflet } from 'react-leaflet';
import { GeoJsonLayer } from '@deck.gl/layers';

import DeckGlOverlayLayer from './plugins/DeckGlOverlayLayer';
import Tooltip from './Tooltip';
import store, { visualizationSlice } from '../../store';

const GEOMETRY_COLOR = [93, 189, 213, 110];
const GEOMETRY_BORDER_COLOR = [93, 189, 213, 255];
const HIGHLIGHTED_GEOMETRY_COLOUR = [45, 147, 173, 130];
const CLICKED_GEOMETRY_COLOUR = [38, 124, 146, 200];

function VectorDataLayer({ data, highlightedDataGeometry, tooltipHolder }) {
  const [tooltip, setTooltip] = useState(null);

  function onGeometryClick(info) {
    store.dispatch(visualizationSlice.actions.setHighlightedDataGeometry(info.object.id));
    const clickedPoint = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: info.coordinate,
      },
    };
    const tooltipInfo = [];
    if (info.object.geometry.type !== 'Polygon') {
      tooltipInfo.push({
        tileId: info.object.tileId,
        properties: info.object.properties,
      });
    } else {
      const intersected = data.filter((d) => booleanPointInPolygon(clickedPoint, d.geometry));
      for (let e of intersected) {
        tooltipInfo.push({
          tileId: e.tileId,
          properties: e.properties,
        });
      }
    }
    setTooltip({
      top: info.pixel[1],
      left: info.pixel[0],
      info: tooltipInfo,
    });
  }

  function onCloseTooltip() {
    setTooltip(null);
    store.dispatch(visualizationSlice.actions.resetHighlightedDataGeometry());
  }

  const polygons = useMemo(() => {
    return new GeoJsonLayer({
      id: 'data-geometries',
      data: data,
      getPolygon: (d) => d.geometry.coordinates,
      getFillColor: (d) => (highlightedDataGeometry === d.id ? CLICKED_GEOMETRY_COLOUR : GEOMETRY_COLOR),
      pickable: true,
      visible: true,
      stroked: true,
      getLineWidth: 1,
      lineWidthUnits: 'pixels',
      onClick: onGeometryClick,
      pointType: 'circle',
      getLineColor: () => GEOMETRY_BORDER_COLOR,
      getPointRadius: 20,
      pointRadiusUnits: 'pixels',
      autoHighlight: true,
      highlightColor: HIGHLIGHTED_GEOMETRY_COLOUR,
      updateTriggers: {
        getFillColor: [highlightedDataGeometry],
      },
    });
    // eslint-disable-next-line
  }, [data, highlightedDataGeometry]);

  return (
    <>
      {tooltip && <Tooltip holderRef={tooltipHolder} tooltip={tooltip} onClose={onCloseTooltip} />}
      <DeckGlOverlayLayer layers={[polygons]} />
    </>
  );
}

export default withLeaflet(VectorDataLayer);
