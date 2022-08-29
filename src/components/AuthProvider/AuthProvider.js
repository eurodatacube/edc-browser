import { useEffect, useState } from 'react';
import store, { errorsSlice } from '../../store';
import { serviceHandlers } from '../../services';
import Loader from '../Loader/Loader';
import CookiePolicyAgreement from '../CookiePolicyAgreement/CookiePolicyAgreement';

const AuthProvider = ({ children }) => {
  const [userAuthInProgress, setUserAuthInProgress] = useState(true);

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
      setUserAuthInProgress(false);
    });
  }, []);

  const authInProgress = userAuthInProgress;

  if (authInProgress) {
    return <Loader type="initial-loader" />;
  }

  const isPublicDeploy = process.env.REACT_APP_PUBLIC_DEPLOY === 'true';
  if (isPublicDeploy) {
    return <CookiePolicyAgreement>{children}</CookiePolicyAgreement>;
  }

  return children;
};

export default AuthProvider;
