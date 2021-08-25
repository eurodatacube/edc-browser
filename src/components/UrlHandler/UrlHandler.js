import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { updatePath, setStore, getUrlParams } from '../../utils/url';

function UrlHandler(props) {
  const { children } = props;
  const [paramsSet, setParamsSet] = useState(false);

  useEffect(() => {
    const params = getUrlParams();
    setStore(params);
    setParamsSet(true);
  }, []);

  useEffect(() => {
    updatePath(props);
  }, [props]);

  if (!paramsSet) {
    return null;
  }

  return children;
}

const mapStoreToProps = (store) => ({
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
  zoom: store.mainMap.zoom,
  collectionId: store.visualization.collectionId,
  layerId: store.visualization.layerId,
  type: store.visualization.type,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
});

export default connect(mapStoreToProps, null)(UrlHandler);
