import { BYOCSubTypes } from '@sentinel-hub/sentinelhub-js';

import { COLLECTION_TYPE } from '../const';

export function getCollectionInfo(collectionsList, collectionId, type, layerId) {
  if (type === COLLECTION_TYPE.GEO_DB) {
    return collectionsList.user.find((c) => c.group === collectionId && c.id === layerId);
  }
  return Object.values(collectionsList)
    .flat()
    .find((c) => c.id === collectionId);
}

export function isCustom(type) {
  return type.startsWith('byoc-') || type.startsWith('batch-') || type.startsWith('zarr-');
}

export function getSubTypeAndCollectionId(type) {
  const ind = type.indexOf('-');
  const subTypeStr = type.slice(0, ind);
  const collectionId = type.slice(ind + 1);

  let subType;
  if (subTypeStr === 'byoc') {
    subType = BYOCSubTypes.BYOC;
  } else if (subTypeStr === 'batch') {
    subType = BYOCSubTypes.BATCH;
  } else if (subTypeStr === 'zarr') {
    subType = BYOCSubTypes.ZARR;
  }
  return { subType: subType, collectionId: collectionId };
}
