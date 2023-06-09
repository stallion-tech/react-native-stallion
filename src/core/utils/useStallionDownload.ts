import { useContext } from 'react';
import { StallionContext } from '../state/StallionController';

const useStallionDownload = () => {
  const { downloadData, handleDownloadBundle, selectedBucketId } =
    useContext(StallionContext);
  return {
    selectedBucketId,
    downloadData,
    handleDownloadBundle,
  };
};

export default useStallionDownload;
