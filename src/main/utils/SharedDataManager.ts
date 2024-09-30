export default class SharedDataManager {
  static _instance?: SharedDataManager | null = null;

  _configProjectId?: string;
  _initProjectId?: string;
  _accessToken?: string;
  _uniqueId?: string;
  _appToken?: string;

  /**
   * @returns {SharedDataManager}
   */
  static getInstance(): SharedDataManager | null | undefined {
    if (SharedDataManager._instance === null) {
      SharedDataManager._instance = new SharedDataManager();
    }

    return this._instance;
  }

  getProjectId(): string {
    return this._configProjectId || this._initProjectId || '';
  }

  getConfigProjectId(): string {
    return this._configProjectId || '';
  }

  setConfigProjectId(id: string): void {
    this._configProjectId = id;
  }

  getInitProjectId(): string {
    return this._initProjectId || '';
  }

  setInitProjectId(id: string): void {
    this._initProjectId = id;
  }

  getAccessToken(): string {
    return this._accessToken || '';
  }

  setAccessToken(accessToken: string): void {
    this._accessToken = accessToken;
  }

  getUid(): string {
    return this._uniqueId || '';
  }

  setUid(uid: string): void {
    this._uniqueId = uid;
  }

  getAppToken(): string {
    return this._appToken || '';
  }

  setAppToken(appToken: string): void {
    this._appToken = appToken;
  }
}
