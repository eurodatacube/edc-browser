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
  DATASET_AWS_HLS,
  HLSAWSLayer,
  DATASET_MODIS,
  MODISLayer,
  DATASET_AWS_DEM,
  DEMLayer,
  DATASET_AWSUS_DEM,
  DEMAWSUSLayer,
  AcquisitionMode,
  Polarization,
  Resolution,
} from '@sentinel-hub/sentinelhub-js';

import { getServiceHandlerForCollectionType } from './index';
import { COLLECTION_TYPE } from '../const';
import { getConfigValue } from '../utils/configurations';

export function LayersFactory(
  collection,
  layerId,
  customVisualizationSelected,
  customEvalscript,
  customEvalscriptUrl,
) {
  if (
    collection.type === COLLECTION_TYPE.SENTINEL_HUB_EDC ||
    collection.type === COLLECTION_TYPE.SENTINEL_HUB
  ) {
    return constructSentinelHubLayer(
      collection,
      layerId,
      customVisualizationSelected,
      customEvalscript,
      customEvalscriptUrl,
    );
  }
  if (collection.type === COLLECTION_TYPE.GEO_DB) {
    const geoDBServiceHandler = getServiceHandlerForCollectionType(COLLECTION_TYPE.GEO_DB);
    return geoDBServiceHandler.getLayer(collection.group, layerId);
  }
  return null;
}

function getSHLayerClass(type) {
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
    case DATASET_AWS_HLS.catalogCollectionId:
      return HLSAWSLayer;
    case DATASET_MODIS.catalogCollectionId:
      return MODISLayer;
    case DATASET_AWS_DEM.shProcessingApiDatasourceAbbreviation:
    case 'dem':
      return DEMLayer;
    case DATASET_AWSUS_DEM.shProcessingApiDatasourceAbbreviation:
      return DEMAWSUSLayer;
    case DATASET_BYOC.id:
      return BYOCLayer;
    default:
      return null;
  }
}

function constructSentinelHubLayer(
  collection,
  layerId,
  customVisualizationSelected,
  customEvalscript,
  customEvalscriptUrl,
) {
  const { type, subType, locationId, collectionId } = collection.serviceSpecificInfo;
  const {
    evalscript,
    evalscriptUrl,
    acquisitionMode,
    polarization,
    resolution,
    upsampling,
    mosaickingOrder,
    demInstance,
  } = getLayerParams(collection, layerId, customVisualizationSelected, customEvalscript, customEvalscriptUrl);

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
    mosaickingOrder: mosaickingOrder,
    demInstance: demInstance,
  });
}

function getLayerParams(
  collection,
  layerId,
  customVisualizationSelected,
  customEvalscript,
  customEvalscriptUrl,
) {
  if (customVisualizationSelected) {
    const defaultRequiredParams = {
      acquisitionMode: AcquisitionMode.IW,
      polarization: Polarization.DV,
      resolution: Resolution.HIGH,
    };
    return {
      ...defaultRequiredParams,
      evalscript: customEvalscript,
      evalscriptUrl: customEvalscriptUrl,
    };
  }

  const foundConfig = collection.configurations.find(
    (configuration) => getConfigValue(configuration, 'sentinelhub:layer_name', 'layer_name') === layerId,
  );

  const layerParams = {
    evalscript: foundConfig.evalscript,
    evalscriptUrl: getConfigValue(foundConfig, 'evalscript_url', 'href'),
    acquisitionMode: getConfigValue(foundConfig, 'sentinelhub:acquisition_mode', 'acquisition_mode'),
    polarization: getConfigValue(foundConfig, 'sentinelhub:polarization', 'polarization'),
    resolution: getConfigValue(foundConfig, 'sentinelhub:resolution', 'resolution'),
    upsampling: getConfigValue(foundConfig, 'sentinelhub:upsampling', 'upsampling'),
    mosaickingOrder: getConfigValue(foundConfig, 'sentinelhub:mosaicking_order', 'mosaicking_order'),
    demInstance: getConfigValue(foundConfig, 'sentinelhub:dem_instance', 'dem_instance'),
  };

  return layerParams;
}
