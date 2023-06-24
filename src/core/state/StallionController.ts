import { createContext, useCallback, useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';

import {
  downloadBundle,
  getAuthTokens,
  getStallionMeta,
  IAuthTokens,
  toggleStallionSwitch as toggleStallionSwitchNative,
} from '../utils/nativeUtil';
import {
  DEFAULT_ERROR_MESSAGE,
  DOWNLOAD_PROGRESS_EVENT,
  EMPTY_ERROR_MESSAGE_BUNDLE,
  IS_ANDROID,
} from '../constants/appConstants';
import StallionNetworkClient from '../network/StallionNetworkClient';
import StallionNativeModule from '../StallionNaitveModule';
import { extractError } from '../utils/errorUtil';

interface IBucket {
  name: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  androidBundles: string[];
  iosBundles: string[];
}

type IBucketList = IBucket[];
type IBucketListPromise = Promise<IBucketList | null>;

interface IBundle {
  version: number;
  id: string;
  createdAt: string;
  updatedAt: string;
  author: {
    fullName: string;
  };
  releaseNote: string;
}

type IBundleList = IBundle[];
type IBundleListPromise = Promise<IBundleList | null>;

export interface IStallionMeta {
  activeBucket?: string;
  activeVersion?: string;
  switchState?: boolean;
}

export interface IBucketData {
  loading: boolean;
  data: IBucketList;
  error?: string | null;
}

const DEFAULT_BUCKET_DATA = {
  loading: false,
  data: [],
};

const DEFAULT_BUCKET_ERROR_DATA = {
  loading: false,
  data: [],
  error: DEFAULT_ERROR_MESSAGE,
};

export interface IBundleData {
  loading: boolean;
  data: IBundleList;
  error?: string | null;
}

export interface IDownloadData {
  loading: boolean;
  error?: string | null;
}

const DEFAULT_BUNDLE_DATA = DEFAULT_BUCKET_DATA;

const DEFAULT_DOWNLOAD_DATA: IDownloadData = {
  loading: false,
  error: null,
};

const DEFAULT_BUNDLE_ERROR_DATA = DEFAULT_BUCKET_ERROR_DATA;

export interface IStallionContext {
  authTokens?: IAuthTokens;
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
  bucketData: IBucketData;
  bundleData: IBundleData;
  fetchBuckets: () => IBucketListPromise;
  fetchBundles: (bucketId: string) => IBundleListPromise;
  selectedBucketId?: string | null;
  setSelectedBucketId: (newBundleId?: string) => void;
  stallionMeta: IStallionMeta;
  refreshStallionMeta: () => void;
  toggleStallionSwitch: (stallionBundleIsOn: boolean) => void;
  currentDownloadFraction: number;
  downloadData: IDownloadData;
  handleDownloadBundle: (bucketId: string, version?: number) => void;
  setCurrentDownloadFraction: (fraction: number) => void;
}

export const StallionContext = createContext<IStallionContext>({
  authTokens: {} as IAuthTokens,
  showModal: false,
  setShowModal: () => {},
  bucketData: DEFAULT_BUCKET_DATA,
  bundleData: DEFAULT_BUNDLE_DATA,
  fetchBuckets: () => new Promise((res) => res([])),
  fetchBundles: () => new Promise((res) => res([])),
  stallionMeta: {},
  refreshStallionMeta: () => {},
  toggleStallionSwitch: () => {},
  setSelectedBucketId: () => {},
  currentDownloadFraction: 0,
  downloadData: DEFAULT_DOWNLOAD_DATA,
  handleDownloadBundle: () => {},
  setCurrentDownloadFraction: () => {},
});

interface IUseStallionBuckets {
  buckets: IBucketData;
  fetchBuckets: () => IBucketListPromise;
}

const getErrorObject = (errorMessage: string) => ({
  loading: false,
  data: [],
  error: errorMessage,
});

export const useStallionBuckets = (): IUseStallionBuckets => {
  const [currentBucketData, setCurrentBucketData] =
    useState<IBucketData>(DEFAULT_BUCKET_DATA);
  const fetchBuckets = useCallback((): IBucketListPromise => {
    setCurrentBucketData((currentData) => ({
      ...currentData,
      loading: true,
    }));
    return StallionNetworkClient.getBuckets()
      .then((res) => {
        if (res?.data) {
          setCurrentBucketData({
            loading: false,
            data: res.data as IBucketList,
            error: null,
          });
        } else {
          setCurrentBucketData(getErrorObject(extractError(res)));
        }
        return res;
      })
      .catch((_) => {
        setCurrentBucketData(DEFAULT_BUCKET_ERROR_DATA);
      });
  }, []);
  return {
    buckets: currentBucketData,
    fetchBuckets,
  };
};

interface IUseStallionBundles {
  bundles: IBundleData;
  fetchBundles: (bucketId: string) => IBundleListPromise;
}

export const useStallionBundles = (): IUseStallionBundles => {
  const [currentBundleData, setCurrentBundleData] =
    useState<IBundleData>(DEFAULT_BUNDLE_DATA);
  const fetchBundles = useCallback((bucketId: string) => {
    setCurrentBundleData((currentData) => ({
      ...currentData,
      loading: true,
    }));
    return StallionNetworkClient.getBundles(bucketId)
      .then((res) => {
        if (res?.data) {
          const bundlesData = IS_ANDROID
            ? res?.data?.androidBundles
            : res?.data?.iosBundles;
          setCurrentBundleData({
            loading: false,
            data: bundlesData,
            error:
              bundlesData?.length === 0 ? EMPTY_ERROR_MESSAGE_BUNDLE : null,
          });
        } else {
          setCurrentBundleData(getErrorObject(extractError(res)));
        }
        return res;
      })
      .catch(() => setCurrentBundleData(DEFAULT_BUNDLE_ERROR_DATA));
  }, []);
  return {
    bundles: currentBundleData,
    fetchBundles,
  };
};

interface IUseStallionMeta {
  stallionMeta: IStallionMeta;
  refreshStallionMeta: () => void;
  toggleStallionSwitch: (stallionBundleIsOn: boolean) => void;
}

export const useStallionMeta = (): IUseStallionMeta => {
  const [stallionMeta, setStallionMeta] = useState<IStallionMeta>({});
  const refreshStallionMeta = useCallback(() => {
    getStallionMeta().then((meta) => {
      meta && setStallionMeta(meta);
    });
  }, []);
  useEffect(() => {
    refreshStallionMeta();
  }, [refreshStallionMeta]);
  const toggleStallionSwitch = (stallionBundleIsOn: boolean) => {
    toggleStallionSwitchNative(stallionBundleIsOn);
    refreshStallionMeta();
  };
  return {
    stallionMeta,
    refreshStallionMeta,
    toggleStallionSwitch,
  };
};

interface IUseDownloadProgress {
  currentDownloadFraction: number;
  setCurrentDownloadFraction: (fraction: number) => void;
}

export const useDownloadProgressListener = (): IUseDownloadProgress => {
  const [currentDownloadFraction, setCurrentDownloadFraction] =
    useState<number>(0);
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(StallionNativeModule);
    eventEmitter.addListener(
      DOWNLOAD_PROGRESS_EVENT,
      (downloadFraction: number) => {
        if (downloadFraction) {
          setCurrentDownloadFraction(downloadFraction);
        }
      }
    );
    () => {
      eventEmitter.removeAllListeners(DOWNLOAD_PROGRESS_EVENT);
    };
  }, []);
  return {
    currentDownloadFraction,
    setCurrentDownloadFraction,
  };
};

interface IUseDownloadData {
  downloadData: IDownloadData;
  handleDownloadBundle: (bucketId: string, version?: number) => void;
}

export const useDownloadData = (
  refreshStallionMeta: () => void,
  setCurrentDownloadFraction: (fraction: number) => void
): IUseDownloadData => {
  const [downloadState, setDownloadState] = useState<IDownloadData>(
    DEFAULT_DOWNLOAD_DATA
  );
  const handleDownloadBundle = useCallback(
    (bucketId: string, version?: number) => {
      setCurrentDownloadFraction(0);
      setDownloadState({
        loading: true,
        error: null,
      });
      requestAnimationFrame(() => {
        downloadBundle({
          bucketId,
          version,
        })
          .then(() => {
            setDownloadState({
              loading: false,
              error: null,
            });
            refreshStallionMeta();
          })
          .catch((err) => {
            setDownloadState({
              loading: false,
              error: err?.toString(),
            });
          });
      });
    },
    [refreshStallionMeta, setCurrentDownloadFraction]
  );
  return {
    downloadData: downloadState,
    handleDownloadBundle,
  };
};

interface IUseAuthTokems {
  authTokens?: IAuthTokens;
}

export const useAuthTokens = (): IUseAuthTokems => {
  const [authTokens, setAuthTokens] = useState<IAuthTokens>();
  useEffect(() => {
    getAuthTokens().then((receivedAuthTokens) => {
      setAuthTokens(receivedAuthTokens);
      StallionNetworkClient.authTokens = receivedAuthTokens;
    });
  }, []);
  return {
    authTokens,
  };
};
