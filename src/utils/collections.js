import { COLLECTION_TYPE } from '../const';

export function getCollectionInfo(collectionsList, collectionId, type, layerId) {
  if (type === COLLECTION_TYPE.GEO_DB) {
    return collectionsList.user.find((c) => c.group === collectionId && c.id === layerId);
  }
  return Object.values(collectionsList)
    .flat()
    .find((c) => c.id === collectionId);
}
