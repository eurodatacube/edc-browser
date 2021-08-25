import toGeoJSON from '@mapbox/togeojson';
import union from '@turf/union';
import { coordEach } from '@turf/meta';
import JSZip from 'jszip';

export async function loadFile(file, format) {
  let loadedFile;
  if (format === 'kmz') {
    loadedFile = await new Promise((resolve) => {
      JSZip.loadAsync(file).then((zip) => {
        zip
          .file(Object.keys(zip.files).find((f) => f.includes('.kml')))
          .async('string')
          .then((data) => resolve(data));
      });
    });
  } else {
    loadedFile = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  }
  return loadedFile;
}

export function parseFile(fileContents, format) {
  let areaOfInterest;
  switch (format) {
    case 'kml':
    case 'kmz':
    case 'gpx':
      const dom = new DOMParser().parseFromString(fileContents, 'text/xml');
      if (format === 'kml' || format === 'kmz') {
        areaOfInterest = toGeoJSON.kml(dom);
      } else {
        areaOfInterest = toGeoJSON.gpx(dom);
      }
      break;
    case 'geojson':
      areaOfInterest = JSON.parse(fileContents);
      break;
    default:
      throw new Error('not supported');
  }

  if (!areaOfInterest) {
    throw new Error('There was a problem parsing the file');
  }

  // We will use only save Polygon/Multipolygon geometry types to the store. So here we will convert them to appropriate types
  if (areaOfInterest.type === 'Feature') {
    areaOfInterest = areaOfInterest.geometry;
  } else if (areaOfInterest.type === 'FeatureCollection') {
    areaOfInterest = convertFeaturesToMultiPolygon(areaOfInterest.features);
  } else if (areaOfInterest.type === 'GeometryCollection') {
    areaOfInterest = convertGeometriesToMultiPolygon(areaOfInterest.geometries);
  }
  ensurePolygonOrMultiPolygon(areaOfInterest);
  areaOfInterest = removeExtraCoordDimensions(areaOfInterest);
  return areaOfInterest;
}

function ensurePolygonOrMultiPolygon(geometry) {
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
    throw new Error('Unsupported GeoJSON geometry type! Only Polygon and MultiPolygon are supported.');
  }
}

function convertFeaturesToMultiPolygon(features) {
  const geometries = features.map((feature) => {
    ensurePolygonOrMultiPolygon(feature.geometry);
    return feature.geometry;
  });
  return convertGeometriesToMultiPolygon(geometries);
}

function convertGeometriesToMultiPolygon(geometries) {
  let multipolygon = geometries[0];
  for (let i = 1; i < geometries.length; i++) {
    multipolygon = union(multipolygon, geometries[i]).geometry;
  }
  return multipolygon;
}

function removeExtraCoordDimensions(geometry) {
  coordEach(geometry, (coord, index) => {
    if (coord.length > 2) {
      geometry.coordinates[0][index] = [coord[0], coord[1]];
    }
  });
  return geometry;
}

export function getFileExtension(filename) {
  return filename.toLowerCase().split('.').pop();
}
