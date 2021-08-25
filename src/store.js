import { configureStore, combineReducers, createSlice, getDefaultMiddleware } from '@reduxjs/toolkit';

import { DEFAULT_LAT_LNG, DEFAULT_FROM_TIME, DEFAULT_TO_TIME } from './const';

export const mainMapSlice = createSlice({
  name: 'mainMap',
  initialState: {
    lat: DEFAULT_LAT_LNG.lat,
    lng: DEFAULT_LAT_LNG.lng,
    zoom: 10,
    enabledOverlaysId: ['labels'],
    enableDrawing: false,
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
    setEnableDrawing: (state, action) => {
      state.enableDrawing = action.payload;
    },
  },
});

export const tabsSlice = createSlice({
  name: 'tabs',
  initialState: {
    selectedMainTabIndex: 0,
    selectedEdcDataTabIndex: 0,
  },
  reducers: {
    setMainTabIndex: (state, action) => {
      state.selectedMainTabIndex = action.payload;
    },
    setEdcDataTabIndex: (state, action) => {
      state.selectedEdcDataTabIndex = action.payload;
    },
  },
});

export const visualizationSlice = createSlice({
  name: 'visualization',
  initialState: {
    collectionId: undefined,
    layerId: undefined,
    type: undefined,
    fromTime: DEFAULT_FROM_TIME,
    toTime: DEFAULT_TO_TIME,
    dataGeometries: [],
    highlightedDataGeometry: undefined,
  },
  reducers: {
    setVisualizationParams: (state, action) => {
      if (action.payload.collectionId !== undefined) {
        state.collectionId = action.payload.collectionId;
      }
      if (action.payload.layerId !== undefined) {
        state.layerId = action.payload.layerId;
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
      state.type = undefined;
      state.dataGeometries = [];
      state.highlightedDataGeometry = undefined;
      state.fromTime = DEFAULT_FROM_TIME;
      state.toTime = DEFAULT_TO_TIME;
    },
  },
});

export const aoiSlice = createSlice({
  name: 'aoi',
  initialState: {},
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

const reducers = combineReducers({
  mainMap: mainMapSlice.reducer,
  tabs: tabsSlice.reducer,
  visualization: visualizationSlice.reducer,
  aoi: aoiSlice.reducer,
  previewAOI: previewAOISlice.reducer,
  commercialData: commercialDataSlice.reducer,
  errors: errorsSlice.reducer,
});

const store = configureStore({
  reducer: reducers,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
}); // Due to "A non-serializable value was detected in an action" => https://github.com/rt2zz/redux-persist/issues/988
export default store;
