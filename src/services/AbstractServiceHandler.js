import {
  DATASET_S2L1C,
  DATASET_S2L2A,
  DATASET_S3SLSTR,
  DATASET_AWS_LMSSL1,
  DATASET_AWS_LTML1,
  DATASET_AWS_LTML2,
  DATASET_AWS_LETML1,
  DATASET_AWS_LETML2,
  DATASET_AWS_LOTL1,
  DATASET_AWS_LOTL2,
} from '@sentinel-hub/sentinelhub-js';

const notImplementedWarning = (methodName, className) =>
  console.warn(`"${methodName}" not implemented by ${className}.`);

export default class AbstractServiceHandler {
  authenticate() {
    // Fetches and sets all tokens the service needs.
    notImplementedWarning('authenticate', this.constructor.name);
  }

  getCollections() {
    // Returns the list of collections in the standard format.
    // {public: Collection[], commercial: Collection[]}
    notImplementedWarning('getCollections', this.constructor.name);
    return {
      public: [],
      commercial: [],
    };
  }

  getBestInitialLocation() {
    return null;
  }

  getConfigurations() {
    return [];
  }

  getAvailableDates() {
    return [];
  }

  supportsDateSelection() {
    return false;
  }

  supportsCustomScript() {
    return false;
  }

  supportsCloudCoverage(collectionId) {
    switch (collectionId) {
      case DATASET_S2L1C.catalogCollectionId:
        return true;
      case DATASET_S2L2A.catalogCollectionId:
        return true;
      case DATASET_S3SLSTR.catalogCollectionId:
        return true;
      case DATASET_AWS_LMSSL1.catalogCollectionId:
        return true;
      case DATASET_AWS_LTML1.catalogCollectionId:
        return true;
      case DATASET_AWS_LTML2.catalogCollectionId:
        return true;
      case DATASET_AWS_LETML1.catalogCollectionId:
        return true;
      case DATASET_AWS_LETML2.catalogCollectionId:
        return true;
      case DATASET_AWS_LOTL1.catalogCollectionId:
        return true;
      case DATASET_AWS_LOTL2.catalogCollectionId:
        return true;
      default:
        return false;
    }
  }

  reset() {}
}
