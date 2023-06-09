import type { IAuthTokens } from '../utils/nativeUtil';

const BASE_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

class StallionNetworkClient {
  static BASE_URL: string = 'https://api.di-gi.in';
  static BUCKETS_PATH: string = '/api/v1/client/bucket/list';
  static BUNDLES_PATH: string = '/api/v1/client/bundle/list';
  static authTokens: IAuthTokens;

  static getHeaders = () => {
    return {
      ...BASE_HEADERS,
      'api-key': StallionNetworkClient.authTokens?.apiKey,
      'secret-key': StallionNetworkClient.authTokens?.secretKey,
    };
  };

  static getBuckets = (): Promise<any> => {
    return fetch(this.BASE_URL + this.BUCKETS_PATH, {
      method: 'GET',
      headers: StallionNetworkClient.getHeaders(),
    }).then((res) => res.json());
  };
  static getBundles = (bucketId: string): Promise<any> => {
    return fetch(this.BASE_URL + this.BUNDLES_PATH, {
      method: 'POST',
      body: JSON.stringify({ bucketId }),
      headers: StallionNetworkClient.getHeaders(),
    }).then((res) => res.json());
  };
}

export default StallionNetworkClient;
