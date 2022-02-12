// backward compatilibity for collections with old param keys in Configurations field
export function getConfigValue(configuration, key, defaultKey) {
  return !!configuration[key] ? configuration[key] : configuration[defaultKey];
}
