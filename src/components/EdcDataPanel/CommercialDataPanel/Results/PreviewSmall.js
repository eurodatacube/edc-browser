import React, { useEffect, useState } from 'react';

import { CacheTarget, CancelToken, isCancelled, TPDI } from '@sentinel-hub/sentinelhub-js';
import { formatDate } from './Results';
import { getServiceHandlerForCollectionType } from '../../../../services';
import { COLLECTION_TYPE } from '../../../../const';

const PreviewSmall = ({ collectionId, product, onClick, cachedPreviews, setCachedPreviews }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const shAuthToken = getServiceHandlerForCollectionType(COLLECTION_TYPE.SENTINEL_HUB).token;

  const fetchPreview = async () => {
    const cancelToken = new CancelToken();

    try {
      setIsLoading(true);
      const imageBlob = await TPDI.getThumbnail(collectionId, product.id, {
        cancelToken: cancelToken,
        authToken: shAuthToken,
        cache: {
          expiresIn: Number.POSITIVE_INFINITY,
          targets: [CacheTarget.CACHE_API],
        },
      });
      const url = URL.createObjectURL(imageBlob);
      setPreviewUrl(url);
      setCachedPreviews([...cachedPreviews, `${collectionId}-${product.id}`]);
      return url;
    } catch (err) {
      if (!isCancelled(err)) {
        console.error(err);
      }
      setPreviewUrl(null);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    // check if preview has already been cached and fetch it. If preview hasn't been cached yet, user will
    // have to click it to see it.
    const isPreviewCached = cachedPreviews.find((key) => key === `${collectionId}-${product.id}`);
    if (isPreviewCached) {
      fetchPreview();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="preview-small">
      {isLoading ? (
        <div className="image-loader">
          <i className="fa fa-spinner fa-spin fa-fw" />
        </div>
      ) : (
        <div className="image-container">
          {isLoaded && (
            <img
              src={previewUrl ? previewUrl : 'images/no_preview.png'}
              alt={`${collectionId}-${product.id}`}
              onClick={() => {
                if (previewUrl) {
                  onClick({
                    url: previewUrl,
                    title: `${formatDate(product.date)}`,
                  });
                }
              }}
              style={{
                cursor: previewUrl ? 'pointer' : 'default',
              }}
            />
          )}

          {(!isLoaded || (isLoaded && previewUrl)) && (
            <div
              className="overlay"
              onClick={async () => {
                const url = isLoaded ? previewUrl : await fetchPreview();
                if (url) {
                  onClick({
                    url: url,
                    title: `${formatDate(product.date)}`,
                  });
                }
              }}
            >
              <i className="fa fa-search" title={`Show preview`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PreviewSmall;
