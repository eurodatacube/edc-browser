const COPERNICUS_SUBGROUPS = {
  CAMS: 'CAMS',
  CLMS: 'CLMS',
  C3S: 'C3S',
  CMEMS: 'CMEMS',
};

const COPERNICUS_DATASETS = {
  '2mt_2020_monthly_average_from_cds': COPERNICUS_SUBGROUPS.CAMS,
  'corine-land-cover': COPERNICUS_SUBGROUPS.CLMS,
  'corine-land-cover-accounting-layers': COPERNICUS_SUBGROUPS.CLMS,
  'global-land-cover': COPERNICUS_SUBGROUPS.CLMS,
  'vegetation-indices': COPERNICUS_SUBGROUPS.CLMS,
  'vegetation-phenology-and-productivity-parameters-season-1': COPERNICUS_SUBGROUPS.CLMS,
  'vegetation-phenology-and-productivity-parameters-season-2': COPERNICUS_SUBGROUPS.CLMS,
  'water-bodies': COPERNICUS_SUBGROUPS.CLMS,
  wind_10m_u: COPERNICUS_SUBGROUPS.C3S,
  wind_10m_v: COPERNICUS_SUBGROUPS.C3S,
  'seasonal-trajectories': COPERNICUS_SUBGROUPS.CLMS,
  oceancolour_bal_chl_l3_nrt_observations_009_049: COPERNICUS_SUBGROUPS.CMEMS,
  oceancolour_atl_chl_l4_nrt_observations_009_037: COPERNICUS_SUBGROUPS.CMEMS,
  oceancolour_med_chl_l4_nrt_observations_009_041: COPERNICUS_SUBGROUPS.CMEMS,
  oceancolour_bs_chl_l4_nrt_observations_009_045: COPERNICUS_SUBGROUPS.CMEMS,
  oceancolour_med_optics_l3_nrt_observations_009_038: COPERNICUS_SUBGROUPS.CMEMS,
};

export const groupBy = (arr, groupByProperty) => {
  const keys = Array.from(new Set(arr.map((element) => element[groupByProperty])));
  const copernicusDatasets = [];
  const otherDatasets = [];

  arr.forEach((element) => {
    const isCopernicusDataset =
      COPERNICUS_DATASETS[element.id] || element[groupByProperty] === 'Copernicus services';
    if (isCopernicusDataset) {
      copernicusDatasets.push(element);
    } else {
      otherDatasets.push(element);
    }
  });

  let obj = {};

  for (let key of keys) {
    obj[key] = otherDatasets.filter((element) => element[groupByProperty] === key);
  }

  copernicusDatasets.forEach((dataset) => {
    const subGroupId = COPERNICUS_DATASETS[dataset.id];
    if (!obj['Copernicus services']) {
      obj['Copernicus services'] = {};
    }
    if (!obj['Copernicus services'][subGroupId]) {
      obj['Copernicus services'][subGroupId] = [];
    }
    obj['Copernicus services'][subGroupId].push(dataset);
  });

  return obj;
};
