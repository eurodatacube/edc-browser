import { useEffect, useState } from 'react';

import store, { errorsSlice } from '../../store';
import { serviceHandlers } from '../../services';

const AuthProvider = ({ children }) => {
  const [authInProgress, setAuthInProgress] = useState(true);
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
      setAuthInProgress(false);
    });
  }, []);

  return authInProgress ? null : children;
};

export default AuthProvider;
