import { useState } from 'react';
import { setAuthToken } from '@sentinel-hub/sentinelhub-js';
import Modal from '../shared/Modal/Modal';
import AnonymousAuth from '../AuthProvider/AnonymousAuth';
import './cookie-policy-agreement.scss';
import Loader from '../Loader/Loader';
import store, { errorsSlice } from '../../store';

const COOKIE_POLICY_STATUSES = {
  accepted: 'accepted',
  rejected: 'rejected',
  neutral: 'neutral',
  finished: 'finished',
};
const { accepted, rejected, neutral, finished } = COOKIE_POLICY_STATUSES;

const LOCAL_STORAGE_PRIVACY_CONSENT_KEY = 'edc-browser-TermsAndPrivacy';

export default function CookiePolicyAgreement({ children }) {
  const [cookiePolicyStatus, setCookiePolicyStatus] = useState(() => {
    const hasAcceptedCookiePolicy = localStorage.getItem(LOCAL_STORAGE_PRIVACY_CONSENT_KEY) === accepted;

    if (hasAcceptedCookiePolicy) {
      return accepted;
    } else {
      return neutral;
    }
  });

  function handleAcceptClick() {
    setCookiePolicyStatus(accepted);
    store.dispatch(errorsSlice.actions.reset());
    localStorage.setItem(LOCAL_STORAGE_PRIVACY_CONSENT_KEY, accepted);
  }

  function handleBackClick() {
    setCookiePolicyStatus(neutral);
  }

  function handleRejectClick() {
    setCookiePolicyStatus(rejected);
  }

  if (cookiePolicyStatus === finished) {
    return children;
  }

  if (cookiePolicyStatus === accepted) {
    return (
      <>
        <Loader type="initial-loader" />
        <AnonymousAuth
          setAnonToken={(token) => {
            setAuthToken(token);
            setCookiePolicyStatus(finished);
          }}
        />
      </>
    );
  }

  if (cookiePolicyStatus === rejected) {
    return (
      <>
        <Modal>
          <div className="cookie-policy">
            <div className="cookie-policy-text">
              We use third-party cookies to provide secure authentication with Sentinel Hub services, which is
              required to provide the basic functionality of the application.
            </div>
            <div className="cookie-policy-buttons">
              <button onClick={handleBackClick} className="button-primary">
                Back
              </button>
            </div>
          </div>
        </Modal>
        {children}
      </>
    );
  }

  return (
    <>
      <Modal>
        <div className="cookie-policy">
          <div className="cookie-policy-text">
            In order to use the application, you need to accept{' '}
            <a
              target="_blank"
              rel="noreferrer"
              className="cookie-policy-link"
              href="https://www.sentinel-hub.com/tos/"
            >
              Terms of Service and Privacy Policy
            </a>
          </div>
          <div className="cookie-policy-buttons">
            <button onClick={handleAcceptClick} className="button-primary">
              Accept
            </button>
            <button onClick={handleRejectClick} className="button-primary">
              Reject
            </button>
          </div>
        </div>
      </Modal>
      {children}
    </>
  );
}
