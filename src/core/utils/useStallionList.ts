import { useCallback, useContext, useMemo } from 'react';
import type { IBucketCard } from '../components/common/BucketCard';
import type { IBundleCard } from '../components/common/BundleCard';
import {
  CARD_TYPES,
  IS_ANDROID,
  VERSION_PREFIX,
} from '../constants/appConstants';
import { StallionContext } from '../state/StallionController';

const useStallionList = () => {
  const {
    bucketData,
    selectedBucketId,
    setSelectedBucketId,
    bundleData,
    fetchBundles,
  } = useContext(StallionContext);
  const listData = useMemo<(IBucketCard | IBundleCard)[] | null>(() => {
    return selectedBucketId
      ? bundleData?.data?.map((bundle) => ({
          type: CARD_TYPES.BUNDLE,
          id: bundle.id,
          version: bundle.version,
          name: `${VERSION_PREFIX}${bundle.version}`,
          description: bundle.releaseNote,
          updatedAt: bundle.updatedAt,
          author: bundle.author.fullName,
        }))
      : bucketData?.data?.map((bucket) => ({
          type: CARD_TYPES.BUCKET,
          id: bucket.id,
          name: bucket.name,
          updatedAt: bucket.updatedAt,
          bundleCount:
            (IS_ANDROID
              ? bucket?.androidBundles?.length
              : bucket?.iosBundles?.length) || 0,
        }));
  }, [selectedBucketId, bundleData, bucketData]);

  const isLoading = useMemo(() => {
    return (
      (selectedBucketId ? bundleData?.loading : bucketData?.loading) || false
    );
  }, [selectedBucketId, bundleData?.loading, bucketData?.loading]);

  const listError = useMemo(() => {
    const selectedDataObject = selectedBucketId ? bundleData : bucketData;
    if (selectedDataObject?.error) return selectedDataObject.error;
    return null;
  }, [selectedBucketId, bundleData, bucketData]);

  const handleBucketPress = useCallback(
    (bucketId) => {
      setSelectedBucketId(bucketId);
      fetchBundles(bucketId);
    },
    [setSelectedBucketId, fetchBundles]
  );

  return {
    listData,
    isLoading,
    listError,
    handleBucketPress,
  };
};

export default useStallionList;
