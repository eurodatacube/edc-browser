import jwt_dec from 'jwt-decode';
import axios from 'axios';

export const LOCAL_STORAGE_ANON_AUTH_KEY = 'edc_browser_anon_auth';
export const UPDATE_BEFORE_EXPIRY_ANON_TOKEN = 60 * 1000; //seconds*miliseconds

const getTokenFromLocalStorage = async (key) => {
  const token = await localStorage.getItem(key);
  let parsedToken;
  try {
    parsedToken = JSON.parse(token);
  } catch (err) {
    console.error(err);
  }

  if (parsedToken && !isTokenExpired(parsedToken)) {
    return parsedToken;
  }
};

export const getAnonTokenFromLocalStorage = () => getTokenFromLocalStorage(LOCAL_STORAGE_ANON_AUTH_KEY);

const saveTokenToLocalStorage = (key, token) => {
  localStorage.setItem(key, JSON.stringify(token));
};

export const saveAnonTokenToLocalStorage = (token) =>
  saveTokenToLocalStorage(LOCAL_STORAGE_ANON_AUTH_KEY, token);

const removeTokenFromLocalStorage = (key) => localStorage.removeItem(key);

export const removeAnonTokenFromLocalStorage = () => removeTokenFromLocalStorage(LOCAL_STORAGE_ANON_AUTH_KEY);

export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  const now = new Date().valueOf();
  const expirationDate = getTokenExpiration(token);
  return expirationDate < now;
};

export const getTokenExpiration = (token) => {
  try {
    if (!token?.access_token) {
      return 0;
    }
    const decodedToken = jwt_dec(token.access_token);
    return decodedToken?.exp * 1000 ?? 0;
  } catch (e) {
    console.error('Error decoding token', e.message);
  }
  return 0;
};

export const scheduleTokenRefresh = (expires_at, updateBeforeExpiry, refreshTimeout, refresh = () => {}) => {
  const now = Date.now();
  const expires_in = expires_at - now;

  const timeout = Math.max(expires_in - updateBeforeExpiry, 0);
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
  //schedule refresh

  refreshTimeout = setTimeout(() => {
    refresh();
  }, timeout);
};

export const fetchAnonTokenUsingService = async (anonTokenServiceUrl, body) => {
  try {
    const { data } = await axios.post(anonTokenServiceUrl, body, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return data;
  } catch (err) {
    console.error('Error while fetching anonymous token', err.message);
  }
  return null;
};
