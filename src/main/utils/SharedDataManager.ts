export default class SharedDataManager {
  static _instance?: SharedDataManager | null = null;

  _projectId?: string;
  _accessToken?: string;

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
    return this._projectId || '';
  }

  setProjectId(id: string): void {
    this._projectId = id;
  }

  getAccessToken(): string {
    return this._accessToken || '';
  }

  setAccessToken(accessToken: string): void {
    this._accessToken = accessToken;
  }
}
