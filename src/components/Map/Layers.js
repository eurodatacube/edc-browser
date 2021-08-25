import { ENV_VARS, getEnvVarValue } from '../../utils/envVarsUtils';

const maptilerKey = getEnvVarValue(ENV_VARS.MAPTILER_KEY);
const mapIdVoyager = getEnvVarValue(ENV_VARS.MAPTILER_MAP_ID_VOYAGER);
const mapIdLight = getEnvVarValue(ENV_VARS.MAPTILER_MAP_ID_LIGHT);
const mapIdLabels = getEnvVarValue(ENV_VARS.MAPTILER_MAP_ID_LABELS);
const mapIdBorders = getEnvVarValue(ENV_VARS.MAPTILER_MAP_ID_BORDERS);
const mapIdRoads = getEnvVarValue(ENV_VARS.MAPTILER_MAP_ID_ROADS);

export const baseLayers = [
  {
    name: 'Voyager',
    url: `https://api.maptiler.com/maps/${mapIdVoyager}/style.json?key=${maptilerKey}`,
    attribution:
      '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    urlType: 'VECTOR', // Indicates that this will be drawn on the map with Mapbox-gl
    checked: true,
  },
  {
    name: 'Light',
    url: `https://api.maptiler.com/maps/${mapIdLight}/style.json?key=${maptilerKey}`,
    attribution:
      '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    urlType: 'VECTOR', // Indicates that this will be drawn on the map with Mapbox-gl
  },
];

// The overlays from maptiler are vector tiles which makes fewer requests than image tiles
export const overlayTileLayers = () => [
  {
    id: 'labels',
    name: `Labels`,
    url: `https://api.maptiler.com/maps/${mapIdLabels}/style.json?key=${maptilerKey}`,
    attribution:
      '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    urlType: 'VECTOR', // Indicates that this will be drawn on the map with Mapbox-gl
    zIndex: 22,
    pane: 'labels',
    preserveDrawingBuffer: true,
  },
  {
    id: 'borders',
    name: `Borders`,
    url: `https://api.maptiler.com/maps/${mapIdBorders}/style.json?key=${maptilerKey}`,
    attribution:
      '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    urlType: 'VECTOR', // Indicates that this will be drawn on the map with Mapbox-gl
    zIndex: 21,
    pane: 'borders',
    preserveDrawingBuffer: true,
  },
  {
    id: 'roads',
    name: `Roads`,
    url: `https://api.maptiler.com/maps/${mapIdRoads}/style.json?key=${maptilerKey}`,
    attribution:
      '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    urlType: 'VECTOR', // Indicates that this will be drawn on the map with Mapbox-gl
    zIndex: 20,
    pane: 'roads',
    preserveDrawingBuffer: true,
  },
];
