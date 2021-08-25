import { useState, useEffect } from 'react';

import EDCHandler from '../../services/EDCHandler';

function AlgorithmsProvider({ children }) {
  const [algorithmsList, setAlgorithmsList] = useState([]);
  const [fetchingInProgress, setFetchingInProgress] = useState(true);

  useEffect(() => {
    setFetchingInProgress(true);
    fetchAndSetListOfAlgorithms();
    // eslint-disable-next-line
  }, []);

  async function fetchAndSetListOfAlgorithms() {
    const algorithms = await EDCHandler.getAlgorithms();
    setAlgorithmsList(algorithms);
    setFetchingInProgress(false);
  }

  return children({ algorithmsList: algorithmsList, algorithmsFetchingInProgress: fetchingInProgress });
}

export default AlgorithmsProvider;
