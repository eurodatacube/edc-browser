import axios from 'axios';
import { SH_SERVICES_URL } from '../services/SentinelHubHandler';

const SH_ACCOUNT_TRIAL = 11000;

// enterprise accounts have codes 1400_ (14000, 14001, ...)
const SH_ACCOUNT_ENTERPRISE_CODE_RANGE = { min: 14000, max: 14999 };

export async function getAccountInfo(authToken, { account }) {
  if (!account) {
    return null;
  }

  try {
    const { data } = await axios.get(`${SH_SERVICES_URL}/oauth/accounts/${account}/account-info`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return data;
  } catch (e) {
    console.error('Unable to get account info:', e.message);
    return null;
  }
}

export function isPayingAccount({ type }) {
  return type !== SH_ACCOUNT_TRIAL;
}

export function isEnterpriseAccount({ type }) {
  if (!type) {
    console.warn('Could not get subscription type. Fall-back to subscription not being enterprise.');
    return false;
  }
  return type >= SH_ACCOUNT_ENTERPRISE_CODE_RANGE.min && type <= SH_ACCOUNT_ENTERPRISE_CODE_RANGE.max;
}
