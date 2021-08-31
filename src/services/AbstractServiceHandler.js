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
}
