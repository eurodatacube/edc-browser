import GeoDBHandler from './GeoDBHandler';
import EDCHandler from './EDCHandler';
import SentinelHubHandler from './SentinelHubHandler';

import { COLLECTION_TYPE } from '../const';
import { ENV_VARS, getEnvVarValue } from '../utils/envVarsUtils';

export const serviceHandlers = [];

export function initializeServiceHandlers() {
  const GEO_DB_CLIENT_ID = getEnvVarValue(ENV_VARS.GEO_DB_CLIENT_ID);
  const GEO_DB_CLIENT_SECRET = getEnvVarValue(ENV_VARS.GEO_DB_CLIENT_SECRET);
  if (GEO_DB_CLIENT_ID && GEO_DB_CLIENT_SECRET) {
    serviceHandlers.push(
      new GeoDBHandler({ GEO_DB_CLIENT_ID: GEO_DB_CLIENT_ID, GEO_DB_CLIENT_SECRET: GEO_DB_CLIENT_SECRET }),
    );
  }

  const SH_CLIENT_ID = getEnvVarValue(ENV_VARS.SH_CLIENT_ID);
  const SH_CLIENT_SECRET = getEnvVarValue(ENV_VARS.SH_CLIENT_SECRET);
  if (SH_CLIENT_ID && SH_CLIENT_SECRET) {
    serviceHandlers.push(new EDCHandler());
    serviceHandlers.push(
      new SentinelHubHandler({ CLIENT_ID: SH_CLIENT_ID, CLIENT_SECRET: SH_CLIENT_SECRET }),
    );
  }
}

export function getServiceHandlerForCollectionType(type) {
  switch (type) {
    case COLLECTION_TYPE.SENTINEL_HUB_EDC:
      return serviceHandlers.find((s) => s.HANDLER_ID === 'EDC');
    case COLLECTION_TYPE.SENTINEL_HUB:
      return serviceHandlers.find((s) => s.HANDLER_ID === 'SENTINEL_HUB');
    case COLLECTION_TYPE.GEO_DB:
      return serviceHandlers.find((s) => s.HANDLER_ID === 'GEO_DB');
    default:
      return null;
  }
}
