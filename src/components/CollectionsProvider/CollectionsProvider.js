import { useEffect, useState } from 'react';

import { serviceHandlers } from '../../services';
import store, { errorsSlice } from '../../store';
import Loader from '../Loader/Loader';

function CollectionsProvider({ children }) {
  const [collectionsList, setCollectionsList] = useState({
    user: [],
    public: [],
    commercial: [],
  });
  const [fetchingInProgress, setFetchingInProgress] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      for (let serviceHandler of serviceHandlers) {
        try {
          const {
            public: publicCollections,
            commercial: commercialCollections,
            user: userCollections,
          } = await serviceHandler.getCollections();

          setCollectionsList((prevState) => {
            return {
              user: [...prevState.user, ...(userCollections ?? [])],
              public: [...prevState.public, ...(publicCollections ?? [])],
              commercial: [...prevState.commercial, ...(commercialCollections ?? [])],
            };
          });
        } catch (err) {
          store.dispatch(errorsSlice.actions.addError({ text: err.message }));
        }
      }
      setFetchingInProgress(false);
    };

    loadCollections();
  }, []);

  return fetchingInProgress ? (
    <Loader type="initial-loader" />
  ) : (
    children({ collectionsList: collectionsList })
  );
}

export default CollectionsProvider;
