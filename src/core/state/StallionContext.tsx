import React, { useMemo, useState } from 'react';
import {
  StallionContext,
  IStallionContext,
  useStallionBuckets,
  useStallionMeta,
  IStallionMeta,
  useDownloadProgressListener,
  useStallionBundles,
  useDownloadData,
  useAuthTokens,
} from './StallionController';

const StallionContextProvider: React.FC = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBucketId, setSelectedBucketId] = useState<string>();
  const { stallionMeta, refreshStallionMeta, toggleStallionSwitch } =
    useStallionMeta();
  const { buckets, fetchBuckets } = useStallionBuckets();
  const { bundles, fetchBundles } = useStallionBundles();
  const { authTokens } = useAuthTokens();
  const { downloadData, handleDownloadBundle } =
    useDownloadData(refreshStallionMeta);
  const { currentDownloadFraction } = useDownloadProgressListener();
  const stallionContextValue = useMemo<IStallionContext>(
    () => ({
      showModal,
      setShowModal,
      bucketData: buckets,
      fetchBuckets,
      bundleData: bundles,
      fetchBundles,
      selectedBucketId,
      setSelectedBucketId,
      stallionMeta: stallionMeta as IStallionMeta,
      refreshStallionMeta,
      toggleStallionSwitch,
      currentDownloadFraction,
      downloadData,
      handleDownloadBundle,
      authTokens,
    }),
    [
      showModal,
      setShowModal,
      buckets,
      fetchBuckets,
      bundles,
      fetchBundles,
      selectedBucketId,
      setSelectedBucketId,
      stallionMeta,
      refreshStallionMeta,
      toggleStallionSwitch,
      currentDownloadFraction,
      downloadData,
      handleDownloadBundle,
      authTokens,
    ]
  );
  return (
    <StallionContext.Provider value={stallionContextValue}>
      {children}
    </StallionContext.Provider>
  );
};

export default StallionContextProvider;
