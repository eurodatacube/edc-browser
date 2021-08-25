import moment from 'moment';

import {
  AirbusProcessingLevel,
  MaxarSensor,
  PlanetProductBundle,
  TPDICollections,
} from '@sentinel-hub/sentinelhub-js';

import { SelectInput } from './SelectInput';
import { SliderInput } from './SliderInput';
import { ToggleInput } from './ToggleInput';
import { createSelectOptions } from '../commercialData.utils';

export const minDateRange = moment.utc('1982-01-01');
export const maxDateRange = moment.utc().endOf('day');

export const providerSpecificParameters = {
  [TPDICollections.PLANET_SCOPE]: [
    {
      id: 'productBundle',
      label: 'Product bundle',
      render: SelectInput,
      options: createSelectOptions(PlanetProductBundle),
    },
    {
      id: 'maxCloudCoverage',
      label: 'Max Cloud Coverage',
      render: SliderInput,
      min: 0,
      max: 100,
      showIcons: false,
      unit: '%',
    },
  ],
  [TPDICollections.MAXAR_WORLDVIEW]: [
    {
      id: 'maxCloudCoverage',
      label: 'Max Cloud Coverage',
      render: SliderInput,
      min: 0,
      max: 100,
      showIcons: false,
      unit: '%',
    },
    {
      id: 'advancedOptions',
      label: 'Advanced options',
      render: ToggleInput,
    },
    {
      id: 'minOffNadir',
      label: 'Min Off Nadir',
      render: SliderInput,
      min: 0,
      max: 45,
      showIcons: false,
      defaultValue: 0,
      advanced: true,
    },
    {
      id: 'maxOffNadir',
      label: 'Max Off Nadir',
      render: SliderInput,
      min: 0,
      max: 45,
      showIcons: false,
      defaultValue: 45,
      advanced: true,
    },
    {
      id: 'minSunElevation',
      label: 'Min Sun Elevation',
      render: SliderInput,
      min: 0,
      max: 90,
      showIcons: false,
      unit: '°',
      defaultValue: 0,
      advanced: true,
    },
    {
      id: 'maxSunElevation',
      label: 'Max Sun Elevation',
      render: SliderInput,
      min: 0,
      max: 90,
      showIcons: false,
      unit: '°',
      defaultValue: 90,
      advanced: true,
    },
    {
      id: 'sensor',
      label: 'Sensor',
      render: SelectInput,
      options: createSelectOptions(MaxarSensor),
      nullValues: true,
      nullValueLabel: 'Any',
      advanced: true,
    },
  ],
  [TPDICollections.AIRBUS_SPOT]: [
    {
      id: 'advancedOptions',
      label: 'Advanced options',
      render: ToggleInput,
    },

    {
      id: 'maxCloudCoverage',
      label: 'Max Cloud Coverage',
      render: SliderInput,
      min: 0,
      max: 100,
      showIcons: false,
      unit: '%',
      advanced: true,
    },
    {
      id: 'processingLevel',
      label: 'Processing Level',
      render: SelectInput,
      options: createSelectOptions(AirbusProcessingLevel),
      nullValues: true,
      nullValueLabel: 'Default',
      advanced: true,
    },
    {
      id: 'maxSnowCoverage',
      label: 'Snow Coverage',
      render: SliderInput,
      min: 0,
      max: 100,
      unit: '%',
      showIcons: false,
      defaultValue: 100,
      advanced: true,
    },
    {
      id: 'maxIncidenceAngle',
      label: 'Incidence Angle',
      render: SliderInput,
      min: 0,
      max: 90,
      showIcons: false,
      unit: '°',
      defaultValue: 90,
      advanced: true,
    },
  ],
  [TPDICollections.AIRBUS_PLEIADES]: [
    {
      id: 'advancedOptions',
      label: 'Advanced options',
      render: ToggleInput,
    },

    {
      id: 'maxCloudCoverage',
      label: 'Max Cloud Coverage',
      render: SliderInput,
      min: 0,
      max: 100,
      showIcons: false,
      unit: '%',
      advanced: true,
    },
    {
      id: 'processingLevel',
      label: 'Processing Level',
      render: SelectInput,
      options: createSelectOptions(AirbusProcessingLevel),
      nullValues: true,
      nullValueLabel: 'Default',
      advanced: true,
    },
    {
      id: 'maxSnowCoverage',
      label: 'Snow Coverage',
      render: SliderInput,
      min: 0,
      max: 100,
      unit: '%',
      showIcons: false,
      defaultValue: 100,
      advanced: true,
    },
    {
      id: 'maxIncidenceAngle',
      label: 'Incidence Angle',
      render: SliderInput,
      min: 0,
      max: 90,
      showIcons: false,
      unit: '°',
      defaultValue: 90,
      advanced: true,
    },
  ],
};
