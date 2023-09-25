import ENV_VAR_NAMES from './envVarNames.json';

export const ENV_VARS = {
  MAPTILER_KEY: 'MAPTILER_KEY',
  MAPTILER_MAP_ID_VOYAGER: 'MAPTILER_MAP_ID_VOYAGER',
  MAPTILER_MAP_ID_LIGHT: 'MAPTILER_MAP_ID_LIGHT',
  MAPTILER_MAP_ID_LABELS: 'MAPTILER_MAP_ID_LABELS',
  MAPTILER_MAP_ID_BORDERS: 'MAPTILER_MAP_ID_BORDERS',
  MAPTILER_MAP_ID_ROADS: 'MAPTILER_MAP_ID_ROADS',
  GEO_DB_CLIENT_ID: 'GEO_DB_CLIENT_ID',
  GEO_DB_CLIENT_SECRET: 'GEO_DB_CLIENT_SECRET',
  SH_CLIENT_ID: 'SH_CLIENT_ID',
  SH_CLIENT_SECRET: 'SH_CLIENT_SECRET',
};

export function getEnvVarValue(envVar) {
  return process.env[ENV_VAR_NAMES[envVar].buildTimeName] || !window._env_
    ? process.env[ENV_VAR_NAMES[envVar].buildTimeName]
    : window._env_[ENV_VAR_NAMES[envVar].runTimeName];
}

export function checkIfPublicDeploy() {
  return process.env.REACT_APP_PUBLIC_DEPLOY === 'true';
}
