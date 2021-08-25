import { CancelToken } from 'axios';

import { ISO_DATE_FORMAT } from '../const';

export const momentToISODate = (momentObj) => momentObj.clone().format(ISO_DATE_FORMAT);

export const requestWithTimeout = (request, timeout) => {
  const source = CancelToken.source();
  setTimeout(() => source.cancel('Request timed out.'), timeout);
  return request(source.token);
};
