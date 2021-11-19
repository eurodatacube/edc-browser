import React, { useMemo, useState } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

import { withLeaflet } from 'react-leaflet';
import { GeoJsonLayer } from '@deck.gl/layers';

import DeckGlOverlayLayer from './plugins/DeckGlOverlayLayer';
import Tooltip from './Tooltip';
import store, { visualizationSlice } from '../../store';
import { MINIMUM_GEOMETRY_SIZE_TO_RENDER_OWN_LAYER } from '../../const';
import { useSelector } from 'react-redux';

const GEOMETRY_COLOR = [239, 111, 108, 110];
const GEOMETRY_BORDER_COLOR = [233, 56, 53, 255];
const HIGHLIGHTED_GEOMETRY_COLOUR = [235, 74, 71, 130];
const CLICKED_GEOMETRY_COLOUR = [220, 28, 24, 130];

function VectorDataLayer({ data, highlightedDataGeometry, tooltipHolder }) {
  const [tooltip, setTooltip] = useState(null);

  const { zoom } = useSelector(({ mainMap }) => mainMap);

  function onGeometryClick(info, object) {
    store.dispatch(visualizationSlice.actions.setHighlightedDataGeometry(object.id));
    const clickedPoint = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: info.coordinate,
      },
    };
    const tooltipInfo = [];
    if (object.geometry.type !== 'Polygon') {
      tooltipInfo.push({
        tileId: object.tileId,
        properties: object.properties,
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

  function getPointRadius() {
    if (zoom >= 1 && zoom <= 6) {
      return 20;
    }

    if (zoom > 6 && zoom <= 8) {
      return 13;
    }

    if (zoom > 8 && zoom <= 12) {
      return 10;
    }

    return 6;
  }

  function constructGeoJsonLayer(id, feature, highlightedDataGeometry, data = null) {
    return new GeoJsonLayer({
      id: id,
      data: data !== null ? data : feature.geometry,
      getPolygon: (d) => (data !== null ? d.geometry.coordinates : d),
      getFillColor: (d) => (highlightedDataGeometry === d.id ? CLICKED_GEOMETRY_COLOUR : GEOMETRY_COLOR),
      pickable: true,
      visible: true,
      stroked: true,
      getLineWidth: 1,
      lineWidthUnits: 'pixels',
      onClick: (info) =>
        data !== null ? onGeometryClick(info, info.object) : onGeometryClick(info, feature),
      pointType: 'circle',
      getLineColor: GEOMETRY_BORDER_COLOR,
      getPointRadius: getPointRadius(),
      pointRadiusUnits: 'pixels',
      autoHighlight: true,
      highlightColor: HIGHLIGHTED_GEOMETRY_COLOUR,
      updateTriggers: {
        getFillColor: [highlightedDataGeometry],
      },
    });
  }

  const polygons = useMemo(() => {
    const smallGeometries = [];

    const largeGeometries = data.filter((d) => {
      if (d.geometrySize > MINIMUM_GEOMETRY_SIZE_TO_RENDER_OWN_LAYER) {
        return true;
      }
      smallGeometries.push(d);
      return false;
    });
    const largeGeometriesLayers = largeGeometries.map((g, i) =>
      constructGeoJsonLayer(`data-geometries ${i}`, g, highlightedDataGeometry),
    );
    const smallGeometriesLayer = constructGeoJsonLayer(
      'data-geometries-small',
      null,
      highlightedDataGeometry,
      smallGeometries,
    );
    return [smallGeometriesLayer, ...largeGeometriesLayers];
    // eslint-disable-next-line
  }, [data, highlightedDataGeometry, zoom]);

  return (
    <>
      {tooltip && <Tooltip holderRef={tooltipHolder} tooltip={tooltip} onClose={onCloseTooltip} />}
      <DeckGlOverlayLayer layers={polygons} />
    </>
  );
}

export default withLeaflet(VectorDataLayer);
