import { coordEach } from '@turf/meta';
import { featureCollection } from '@turf/helpers';

export function isCoordsEmpty(geojsonFeature) {
  let coordsEmpty = false;
  coordEach(geojsonFeature, (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) => {
    if (!currentCoord) {
      coordsEmpty = true;
    }
  });

  return coordsEmpty;
}

// Accepts a geojson, where we look if one of the features has any coordinate that is undefined.
// If the feature has a non valid coordinate, we remove that feature, or we return null when the FeatureCollection has no valid feature(coordinates)
export function removeAoiWithEmptyCoords(geojson) {
  switch (geojson.type) {
    case 'Feature':
      if (isCoordsEmpty(geojson)) {
        return null;
      }
      return geojson;
    case 'FeatureCollection':
      const features = geojson.features.filter((feature) => !isCoordsEmpty(feature));
      return features.length > 0
        ? featureCollection(
            geojson.features.filter((feature) => {
              return !isCoordsEmpty(feature);
            }),
          )
        : null;
    default:
      return geojson;
  }
}
