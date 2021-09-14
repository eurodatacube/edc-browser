import { useState, useEffect } from 'react';

import EDCHandler from '../../services/EDCHandler';
import store, { errorsSlice } from '../../store';

function AlgorithmsProvider({ children }) {
  const [algorithmsList, setAlgorithmsList] = useState([]);
  const [fetchingInProgress, setFetchingInProgress] = useState(true);

  useEffect(() => {
    setFetchingInProgress(true);
    fetchAndSetListOfAlgorithms();
    // eslint-disable-next-line
  }, []);

  async function fetchAndSetListOfAlgorithms() {
    try {
      const algorithms = await EDCHandler.getAlgorithms();
      setAlgorithmsList(algorithms);
    } catch (err) {
      store.dispatch(errorsSlice.actions.addError({ text: err.message }));
    }
    setFetchingInProgress(false);
  }

  return children({ algorithmsList: algorithmsList, algorithmsFetchingInProgress: fetchingInProgress });
}

export default AlgorithmsProvider;
