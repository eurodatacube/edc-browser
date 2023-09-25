import { useState } from 'react';
import Modal from '../shared/Modal/Modal';
import store, { errorsSlice, consentSlice } from '../../store';

import './TOSAgreement.scss';

const ACCEPTED = 'accepted';
const LOCAL_STORAGE_PRIVACY_CONSENT_KEY = 'edc-browser-TermsAndPrivacy';

export default function TOSAgreement() {
  const hasAcceptedTOS = localStorage.getItem(LOCAL_STORAGE_PRIVACY_CONSENT_KEY) === ACCEPTED;
  const [hasRejected, setHasRejected] = useState(false);

  function handleAcceptClick() {
    store.dispatch(consentSlice.actions.setTermsAndPrivacyConsent(true));
    store.dispatch(errorsSlice.actions.reset());
    localStorage.setItem(LOCAL_STORAGE_PRIVACY_CONSENT_KEY, ACCEPTED);
  }

  function handleBackClick() {
    setHasRejected(false);
    store.dispatch(consentSlice.actions.setTermsAndPrivacyConsent(false));
  }

  function handleRejectClick() {
    setHasRejected(true);
    store.dispatch(consentSlice.actions.setTermsAndPrivacyConsent(false));
  }

  if (hasAcceptedTOS) {
    store.dispatch(consentSlice.actions.setTermsAndPrivacyConsent(true));
    return null;
  }

  if (hasRejected) {
    return (
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
    );
  }

  return (
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
  );
}
