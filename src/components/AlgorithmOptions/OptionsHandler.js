import moment from 'moment';
import { ALGORITHM_TYPES } from '../../const';

import { momentToISODate } from '../../utils';

function OptionsHandler({ children, algorithm }) {
  const defaultValues = {};
  const optionsToRemove = [];
  const defaultTimerange = `${momentToISODate(moment.utc())}/${momentToISODate(moment.utc())}`;
  const defaultDate = momentToISODate(moment.utc());
  let options = algorithm.inputs;

  for (let option of options) {
    const isAOICrs =
      option.type === 'crs' &&
      option.describes &&
      options.find((o) => o.id === option.describes).type === ALGORITHM_TYPES.bbox;
    if (isAOICrs) {
      defaultValues[option.id] = { value: 4326, isValid: true };
      optionsToRemove.push(option.id);
    }

    if (option.type === ALGORITHM_TYPES.date) {
      defaultValues[option.id] = { value: defaultDate, isValid: true };
    }

    if (option.type === ALGORITHM_TYPES.daterange) {
      defaultValues[option.id] = { value: defaultTimerange, isValid: true };
    }
  }

  options = options.filter((o) => !optionsToRemove.includes(o.id));

  return children({
    options: options,
    defaultValues: defaultValues,
  });
}

export default OptionsHandler;
