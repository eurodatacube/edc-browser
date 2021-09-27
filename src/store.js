import { configureStore, combineReducers, createSlice, getDefaultMiddleware } from '@reduxjs/toolkit';

import {
  DEFAULT_LAT_LNG,
  DEFAULT_FROM_TIME,
  DEFAULT_TO_TIME,
  AOI_SHAPE,
  MAX_GEODB_FEATURES,
  DEFAULT_EDC_PUBLIC_GROUP,
} from './const';

export const mainMapSlice = createSlice({
  name: 'mainMap',
  initialState: {
    lat: DEFAULT_LAT_LNG.lat,
    lng: DEFAULT_LAT_LNG.lng,
    zoom: 10,
    enabledOverlaysId: ['labels'],
  },
  reducers: {
    setPosition: (state, action) => {
      const { lat, lng, zoom } = action.payload;
      if (lat !== undefined && lng !== undefined) {
        state.lat = lat;
        state.lng = lng;
      }
      if (zoom !== undefined) {
        state.zoom = zoom;
      }
    },
    setViewport: (state, action) => {
      const {
        center: [lat, lng],
        zoom,
      } = action.payload;
      state.lat = lat;
      state.lng = lng;
      state.zoom = zoom;
    },
    setBounds: (state, action) => {
      const { bounds, pixelBounds } = action.payload;
      state.bounds = bounds;
      state.pixelBounds = pixelBounds;
    },
    addOverlay: (state, action) => {
      state.enabledOverlaysId.push(action.payload);
    },
    removeOverlay: (state, action) => {
      const overlayIndex = state.enabledOverlaysId.indexOf(action.payload);
      if (overlayIndex !== -1) {
        state.enabledOverlaysId.splice(overlayIndex, 1);
      }
    },
  },
});

export const tabsSlice = createSlice({
  name: 'tabs',
  initialState: {
    selectedMainTabIndex: 0,
    selectedEdcDataTabIndex: 0,
    selectedUserDataTabIndex: 0,
    selectedGroup: DEFAULT_EDC_PUBLIC_GROUP,
  },
  reducers: {
    setMainTabIndex: (state, action) => {
      state.selectedMainTabIndex = action.payload;
    },
    setEdcDataTabIndex: (state, action) => {
      state.selectedEdcDataTabIndex = action.payload;
    },
    setUserDataTabIndex: (state, action) => {
      state.selectedUserDataTabIndex = action.payload;
    },
    setSelectedGroup: (state, action) => {
      state.selectedGroup = action.payload;
    },
  },
});

export const visualizationSlice = createSlice({
  name: 'visualization',
  initialState: {
    collectionId: undefined,
    layerId: undefined,
    customVisualizationSelected: false,
    evalscript: undefined,
    evalscriptUrl: undefined,
    type: undefined,
    fromTime: DEFAULT_FROM_TIME,
    toTime: DEFAULT_TO_TIME,
    dataGeometries: [],
    highlightedDataGeometry: undefined,
    maxGeoDBFeatures: MAX_GEODB_FEATURES,
  },
  reducers: {
    setVisualizationParams: (state, action) => {
      if (action.payload.collectionId !== undefined) {
        state.collectionId = action.payload.collectionId;
      }
      if (action.payload.layerId !== undefined) {
        state.layerId = action.payload.layerId;
      }
      if (action.payload.customVisualizationSelected !== undefined) {
        state.customVisualizationSelected = action.payload.customVisualizationSelected;
      }
      if (action.payload.evalscript !== undefined) {
        state.evalscript = action.payload.evalscript;
      }
      if (action.payload.evalscriptUrl !== undefined) {
        state.evalscriptUrl = action.payload.evalscriptUrl;
      }
      if (action.payload.type !== undefined) {
        state.type = action.payload.type;
      }
      if (action.payload.fromTime !== undefined) {
        state.fromTime = action.payload.fromTime;
      }
      if (action.payload.toTime !== undefined) {
        state.toTime = action.payload.toTime;
      }
      if (action.payload.maxGeoDBFeatures !== undefined) {
        state.maxGeoDBFeatures = action.payload.maxGeoDBFeatures;
      }
    },
    addDataGeometries: (state, action) => {
      const idsInState = state.dataGeometries.map((d) => d.id);
      state.dataGeometries = [
        ...state.dataGeometries,
        ...action.payload.filter((d) => !idsInState.includes(d.id)),
      ];
    },
    removeTileDataGeometries: (state, action) => {
      state.dataGeometries = state.dataGeometries.filter((g) => g.tileId !== action.payload);
    },
    setHighlightedDataGeometry: (state, action) => {
      state.highlightedDataGeometry = action.payload;
    },
    resetHighlightedDataGeometry: (state, action) => {
      state.highlightedDataGeometry = undefined;
    },
    reset: (state) => {
      state.collectionId = undefined;
      state.layerId = undefined;
      state.customVisualizationSelected = undefined;
      state.evalscript = undefined;
      state.evalscriptUrl = undefined;
      state.type = undefined;
      state.dataGeometries = [];
      state.highlightedDataGeometry = undefined;
      state.fromTime = DEFAULT_FROM_TIME;
      state.toTime = DEFAULT_TO_TIME;
      state.maxGeoDBFeatures = MAX_GEODB_FEATURES;
    },
  },
});

export const aoiSlice = createSlice({
  name: 'aoi',
  initialState: {
    drawingEnabled: false,
    shape: AOI_SHAPE.rectangle,
  },
  reducers: {
    set: (state, action) => {
      state.geometry = action.payload.geometry;
      state.bounds = action.payload.bounds;
      state.lastEdited = new Date().toISOString();
    },
    reset: (state) => {
      state.geometry = null;
      state.bounds = null;
      state.lastEdited = new Date().toISOString();
      state.drawingEnabled = false;
      state.shape = AOI_SHAPE.rectangle;
    },
    setShape: (state, action) => {
      state.shape = action.payload;
    },
    setDrawingEnabled: (state, action) => {
      state.drawingEnabled = action.payload;
    },
  },
});

export const previewAOISlice = createSlice({
  name: 'previewAOI',
  initialState: {},
  reducers: {
    set: (state, action) => {
      state.geometry = action.payload;
    },
    reset: (state) => {
      state.geometry = null;
    },
  },
});

export const commercialDataSlice = createSlice({
  name: 'commercialData',
  initialState: {
    searchResults: [],
    displaySearchResults: false,
    location: null,
    highlightedResult: null,
    selectedOrder: null,
  },
  reducers: {
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
      state.displaySearchResults = action.payload.length > 0;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setHighlightedResult: (state, action) => {
      state.highlightedResult = action.payload;
    },
    setDisplaySearchResults: (state, action) => {
      state.displaySearchResults = action.payload;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    reset: (state, action) => {
      state.highlightedResult = null;
      state.searchResults = [];
      state.location = null;
      state.displaySearchResults = false;
      state.selectedOrder = null;
    },
  },
});

export const errorsSlice = createSlice({
  name: 'errors',
  initialState: {
    errors: [],
  },
  reducers: {
    addError: (state, action) => {
      state.errors = [...state.errors, action.payload];
    },
    reset: (state) => {
      state.errors = [];
    },
  },
});

export const indexSlice = createSlice({
  name: 'index',
  initialState: {
    handlePositions: null,
    gradient: null,
  },
  reducers: {
    setHandlePositions: (state, action) => {
      state.handlePositions = action.payload;
    },
    setGradient: (state, action) => {
      state.gradient = action.payload;
    },
  },
});

export const paginationSlice = createSlice({
  name: 'pagination',
  initialState: {
    hasMore: false,
    nFetched: 0,
  },
  reducers: {
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    addFetched: (state, action) => {
      state.nFetched = state.nFetched + action.payload;
    },
    reset: (state, action) => {
      state.hasMore = false;
      state.nFetched = 0;
    },
  },
});

export const algorithmsSlice = createSlice({
  name: 'algorithms',
  initialState: {
    selectedAlgorithm: null,
  },
  reducers: {
    setSelectedAlgorithm: (state, action) => {
      state.selectedAlgorithm = action.payload;
    },
  },
});

const reducers = combineReducers({
  mainMap: mainMapSlice.reducer,
  tabs: tabsSlice.reducer,
  visualization: visualizationSlice.reducer,
  aoi: aoiSlice.reducer,
  previewAOI: previewAOISlice.reducer,
  commercialData: commercialDataSlice.reducer,
  errors: errorsSlice.reducer,
  index: indexSlice.reducer,
  pagination: paginationSlice.reducer,
  algorithms: algorithmsSlice.reducer,
});

const store = configureStore({
  reducer: reducers,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
}); // Due to "A non-serializable value was detected in an action" => https://github.com/rt2zz/redux-persist/issues/988
export default store;
