import { CancelToken } from 'axios';

import { ISO_DATE_FORMAT } from '../const';

export const momentToISODate = (momentObj) => momentObj.clone().format(ISO_DATE_FORMAT);

export const requestWithTimeout = (request, timeout) => {
  const source = CancelToken.source();
  setTimeout(() => source.cancel('Request timed out.'), timeout);
  return request(source.token);
};

function readBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const json = JSON.parse(e.target.result);
        resolve(json);
      } catch (err) {
        reject({});
      }
    };

    reader.readAsText(blob);
  });
}

export async function constructErrorMessage(error) {
  const DEFAULT_ERROR = JSON.stringify(error);

  if (error.response && error.response.data) {
    let errorObj;

    if (error.response.data instanceof Blob) {
      const errorJson = await readBlob(error.response.data);
      errorObj = errorJson.error;
      if (!errorObj) {
        return DEFAULT_ERROR;
      }
    } else {
      errorObj = error.response.data.error;
    }

    let errorMsg = '';

    if (errorObj.errors) {
      for (let err of errorObj.errors) {
        for (let key in err) {
          errorMsg += `${key}:\n${JSON.stringify(err[key])}\n\n`;
        }
      }
    } else {
      errorMsg = errorObj.message;
    }
    return errorMsg;
  } else {
    return error.message ? error.message : DEFAULT_ERROR;
  }
}
