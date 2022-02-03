import React from 'react';
import { connect } from 'react-redux';

import { TPDICollections } from '@sentinel-hub/sentinelhub-js';

import { NotificationPanel } from '../../../junk/NotificationPanel/NotificationPanel';
import { Button } from '../../../junk/Button/Button';
import { AOISelection } from './AOISelection';
import DateInput from './DateInput';
import { SelectInput } from './SelectInput';

import { providerSpecificSearchParameters, minDateRange, maxDateRange } from './config';

import './Search.scss';

const TPDICollectionsWithLabels = [
  { value: TPDICollections.AIRBUS_PLEIADES, label: 'Airbus Pleiades' },
  { value: TPDICollections.AIRBUS_SPOT, label: 'Airbus SPOT' },
  { value: TPDICollections.MAXAR_WORLDVIEW, label: 'Maxar WorldView ' },
  { value: TPDICollections.PLANET_SCOPE, label: 'Planet PlanetScope' },
];

const Search = ({
  onSearch,
  searchParams,
  handleSearchParamChange,
  searchInProgress,
  searchError,
  aoiGeometry,
  aoiDrawingEnabled,
  mapBounds,
}) => {
  const renderDataProviderParameters = (dataProvider, params, onChangeHandler) => {
    let providerParameters = providerSpecificSearchParameters[dataProvider];
    if (!!providerParameters && !params.advancedOptions) {
      providerParameters = providerParameters.filter(
        (input) => input.advanced === undefined || !input.advanced,
      );
    }

    return (
      <>
        {!!providerParameters &&
          providerParameters.map((input) =>
            input.render({ input: input, params: params, onChangeHandler: onChangeHandler }),
          )}
      </>
    );
  };

  const validateSearchParams = () => {
    //check provider specific params

    return !!aoiGeometry;
  };

  return (
    <div className="commercial-data-search">
      <AOISelection aoiGeometry={aoiGeometry} aoiDrawingEnabled={aoiDrawingEnabled} mapBounds={mapBounds} />
      <DateInput
        id="fromTime-date-input"
        key="fromTime"
        name="fromTime"
        value={searchParams.fromTime}
        label="From"
        onChangeHandler={handleSearchParamChange}
        min={minDateRange}
        max={searchParams.toTime}
      />

      <DateInput
        name="toTime"
        value={searchParams.toTime}
        label="To"
        onChangeHandler={handleSearchParamChange}
        min={searchParams.fromTime}
        max={maxDateRange}
      />

      <SelectInput
        input={{
          id: 'dataProvider',
          label: 'Constellation',
          options: TPDICollectionsWithLabels,
        }}
        params={searchParams}
        onChangeHandler={handleSearchParamChange}
      />

      {renderDataProviderParameters(searchParams.dataProvider, searchParams, handleSearchParamChange)}

      <Button
        fluid
        onClick={onSearch}
        disabled={searchInProgress || !validateSearchParams()}
        loading={searchInProgress}
        text="Search"
      />

      {searchError && <NotificationPanel type="error" msg={searchError} />}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  aoiGeometry: store.aoi.geometry,
  aoiDrawingEnabled: store.aoi.drawingEnabled,
  mapBounds: store.mainMap.bounds,
});

export default connect(mapStoreToProps, null)(Search);
