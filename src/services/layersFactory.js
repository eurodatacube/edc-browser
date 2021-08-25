import {
  DATASET_AWSEU_S1GRD,
  S1GRDAWSEULayer,
  DATASET_S2L2A,
  S2L2ALayer,
  DATASET_S2L1C,
  S2L1CLayer,
  DATASET_BYOC,
  BYOCLayer,
  DATASET_S3SLSTR,
  S3SLSTRLayer,
  DATASET_S3OLCI,
  S3OLCILayer,
  DATASET_S5PL2,
  S5PL2Layer,
  DATASET_AWS_LOTL1,
  Landsat8AWSLOTL1Layer,
  DATASET_AWS_LOTL2,
  Landsat8AWSLOTL2Layer,
  DATASET_AWS_LTML1,
  Landsat45AWSLTML1Layer,
  DATASET_AWS_LTML2,
  Landsat45AWSLTML2Layer,
  DATASET_AWS_LMSSL1,
  Landsat15AWSLMSSL1Layer,
  DATASET_AWS_LETML1,
  Landsat7AWSLETML1Layer,
  DATASET_AWS_LETML2,
  Landsat7AWSLETML2Layer,
  DATASET_MODIS,
  MODISLayer,
  DATASET_AWS_DEM,
  DEMLayer,
  DATASET_AWSUS_DEM,
  DEMAWSUSLayer,
  LocationIdSHv3,
  SHV3_LOCATIONS_ROOT_URL,
  BYOCSubTypes,
} from '@sentinel-hub/sentinelhub-js';

import { getServiceHandlerForCollectionType } from './index';
import { COLLECTION_TYPE } from '../const';

export function LayersFactory(collection, layerId) {
  if (
    collection.type === COLLECTION_TYPE.SENTINEL_HUB_EDC ||
    collection.type === COLLECTION_TYPE.SENTINEL_HUB
  ) {
    return constructSentinelHubLayer(collection, layerId);
  }
  if (collection.type === COLLECTION_TYPE.GEO_DB) {
    const geoDBServiceHandler = getServiceHandlerForCollectionType(COLLECTION_TYPE.GEO_DB);
    return geoDBServiceHandler.getLayer(collection.group, layerId);
  }
  return null;
}

function getSHLayerClass(type) {
  if (isCustom(type)) {
    return BYOCLayer;
  }
  switch (type) {
    case DATASET_AWSEU_S1GRD.catalogCollectionId:
      return S1GRDAWSEULayer;
    case DATASET_S2L1C.catalogCollectionId:
      return S2L1CLayer;
    case DATASET_S2L2A.catalogCollectionId:
      return S2L2ALayer;
    case DATASET_S3SLSTR.catalogCollectionId:
      return S3SLSTRLayer;
    case DATASET_S3OLCI.catalogCollectionId:
      return S3OLCILayer;
    case DATASET_S5PL2.catalogCollectionId:
      return S5PL2Layer;
    case DATASET_AWS_LOTL1.catalogCollectionId:
      return Landsat8AWSLOTL1Layer;
    case DATASET_AWS_LOTL2.catalogCollectionId:
      return Landsat8AWSLOTL2Layer;
    case DATASET_AWS_LTML1.catalogCollectionId:
      return Landsat45AWSLTML1Layer;
    case DATASET_AWS_LTML2.catalogCollectionId:
      return Landsat45AWSLTML2Layer;
    case DATASET_AWS_LMSSL1.catalogCollectionId:
      return Landsat15AWSLMSSL1Layer;
    case DATASET_AWS_LETML1.catalogCollectionId:
      return Landsat7AWSLETML1Layer;
    case DATASET_AWS_LETML2.catalogCollectionId:
      return Landsat7AWSLETML2Layer;
    case DATASET_MODIS.catalogCollectionId:
      return MODISLayer;
    case DATASET_AWS_DEM.shProcessingApiDatasourceAbbreviation:
      return DEMLayer;
    case DATASET_AWSUS_DEM.shProcessingApiDatasourceAbbreviation:
      return DEMAWSUSLayer;
    case DATASET_BYOC.id:
      return BYOCLayer;
    default:
      return null;
  }
}

function constructSentinelHubLayer(collection, layerId) {
  const { type, providers } = collection.serviceSpecificInfo;
  const {
    evalscript,
    evalscript_url: evalscriptUrl,
    acquisition_mode: acquisitionMode,
    polarization,
    resolution,
    upsampling,
    mosaicking_order,
    dem_instance,
  } = collection.configurations.find((configuration) => configuration.layer_name === layerId);

  const { collectionId, subType } = handleCustomCollections(type);
  const locationId = getLocationId(providers) || LocationIdSHv3.awsEuCentral1;

  const layerClass = getSHLayerClass(type);
  if (!layerClass) {
    return null;
  }
  return new layerClass({
    evalscript: evalscript,
    evalscriptUrl: evalscriptUrl,
    collectionId: collectionId,
    subType: subType,
    locationId: locationId,
    acquisitionMode: acquisitionMode,
    polarization: polarization,
    resolution: resolution,
    upsampling: upsampling,
    mosaickingOrder: mosaicking_order,
    demInstance: dem_instance,
  });
}

function isCustom(type) {
  return type.startsWith('byoc-') || type.startsWith('batch-');
}

function handleCustomCollections(type) {
  if (!isCustom(type)) {
    return {};
  }
  const ind = type.indexOf('-');
  const subTypeStr = type.slice(0, ind);
  const collectionId = type.slice(ind + 1);

  let subType;
  if (subTypeStr === 'byoc') {
    subType = BYOCSubTypes.BYOC;
  } else if (subTypeStr === 'batch') {
    subType = BYOCSubTypes.BATCH;
  }
  return { subType: subType, collectionId: collectionId };
}

function getLocationId(providers) {
  let { url: host } = providers.find((p) => p.roles.includes('processor'));
  return Object.keys(SHV3_LOCATIONS_ROOT_URL).find((key) => {
    const url = new URL(SHV3_LOCATIONS_ROOT_URL[key]);
    return url.host === host;
  });
}
