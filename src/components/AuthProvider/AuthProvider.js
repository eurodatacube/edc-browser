import { useEffect, useState } from 'react';
import { setAuthToken } from '@sentinel-hub/sentinelhub-js';

import AnonymousAuth from './AnonymousAuth';
import store, { errorsSlice } from '../../store';
import { serviceHandlers } from '../../services';
import Loader from '../Loader/Loader';

const AuthProvider = ({ children }) => {
  const isPublicDeploy = process.env.REACT_APP_PUBLIC_DEPLOY === 'true';
  const [userAuthInProgress, setUserAuthInProgress] = useState(true);
  const [anonAuthInProgress, setAnonAuthInProgress] = useState(isPublicDeploy);

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

  function setAnonToken(token) {
    setAuthToken(token);
    setAnonAuthInProgress(false);
  }

  const authInProgress = userAuthInProgress || anonAuthInProgress;

  return authInProgress ? (
    <>
      <Loader type="initial-loader" />
      {isPublicDeploy && <AnonymousAuth setAnonToken={setAnonToken} />}
    </>
  ) : (
    children
  );
};

export default AuthProvider;
