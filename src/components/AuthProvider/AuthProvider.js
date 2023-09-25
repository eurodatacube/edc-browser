import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { setAuthToken } from '@sentinel-hub/sentinelhub-js';

import store, { errorsSlice } from '../../store';
import { checkIfPublicDeploy } from '../../utils/envVarsUtils';
import { serviceHandlers } from '../../services';
import Loader from '../Loader/Loader';
import TOSAgreement from '../TOSAgreement/TOSAgreement';
import AnonymousAuth from './AnonymousAuth';

const AuthProvider = ({ children, termsAndPrivacyConsent }) => {
  const isPublicDeploy = checkIfPublicDeploy();
  const [servicesAuthInProgress, setServicesAuthInProgress] = useState(true);
  const [anonAuthInProgress, setAnonAuthInProgress] = useState(true);

  useEffect(() => {
    const authenticateAllServices = async () => {
      for (let serviceHandler of serviceHandlers) {
        try {
          await serviceHandler.authenticate();
        } catch (err) {
          store.dispatch(errorsSlice.actions.addError({ text: err.message }));
        }
      }
    };

    Promise.all([authenticateAllServices()]).then(() => {
      setServicesAuthInProgress(false);
    });
  }, []);

  const setAnonAuth = (token) => {
    setAnonAuthInProgress(false);
    setAuthToken(token);
  };

  const renderUserDeploy = () => {
    if (servicesAuthInProgress) {
      return <Loader type="initial-loader" />;
    }
    return children;
  };

  const renderPublicDeploy = () => {
    const authInProgress = servicesAuthInProgress || anonAuthInProgress;
    return (
      <>
        {!termsAndPrivacyConsent && <TOSAgreement />}
        {termsAndPrivacyConsent && <AnonymousAuth setAnonToken={(token) => setAnonAuth(token)} />}
        {authInProgress && <Loader type="initial-loader" />}
        {termsAndPrivacyConsent && !authInProgress && children}
      </>
    );
  };

  return isPublicDeploy ? renderPublicDeploy() : renderUserDeploy();
};

const mapStoreToProps = (store) => ({
  termsAndPrivacyConsent: store.consentSlice.termsAndPrivacyConsent,
});
export default connect(mapStoreToProps)(AuthProvider);
