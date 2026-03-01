/**
 * クラウドバックアップ機能
 *
 * File System Access API を使ってユーザーが選んだファイル
 * （Google Drive / OneDrive / ローカル等）へ自動バックアップする。
 * FileSystemFileHandle は IndexedDB に永続保存する。
 *
 * 対応ブラウザ: Chrome / Edge 86+
 * 非対応時: 手動エクスポート/インポートにフォールバック
 */

const CloudBackup = {
  DB_NAME: 'runMoveMapBackupDB',
  STORE_NAME: 'handles',
  HANDLE_KEY: 'backupFileHandle',

  /** @type {FileSystemFileHandle|null} */
  fileHandle: null,

  /** File System Access API が使えるか */
  isSupported: false,
  /** 非対応時の理由 */
  unsupportedReason: null,
  /** 直近の保存先選択エラー */
  lastError: null,

  // ─────────────────────────────────────────────────────────
  // 公開 API
  // ─────────────────────────────────────────────────────────

  /**
   * 初期化
   * @returns {{ isSupported: boolean, hasHandle: boolean }}
   */
  async init() {
    this.unsupportedReason = this._detectUnsupportedReason();
    this.isSupported = this.unsupportedReason === null;
    this.lastError = null;

    if (this.isSupported) {
      this.fileHandle = await this._loadHandle();
    }

    return {
      isSupported: this.isSupported,
      hasHandle: !!this.fileHandle,
      reason: this.unsupportedReason,
    };
  },

  /**
   * バックアップファイルの保存先をユーザーに選ばせる
   * ※ ユーザーの操作（クリック等）から呼び出すこと
   * @returns {boolean} 選択成功 or キャンセル
   */
  async selectBackupFile() {
    if (!this.isSupported) return false;

    try {
      this.lastError = null;
      const pickerOptions = {
        suggestedName: 'japan-journey-backup.json',
        types: [
          {
            description: 'JSON バックアップファイル',
            accept: { 'application/json': ['.json'] },
          },
        ],
        startIn: 'documents',
      };
      const handle = await this._showSaveFilePickerWithFallback(pickerOptions);

      this.fileHandle = handle;
      await this._saveHandle(handle);
      return true;
    } catch (e) {
      this.lastError = {
        name: e?.name || 'Error',
        message: e?.message || 'Unknown error',
      };
      if (e.name !== 'AbortError') {
        console.error('保存先の選択に失敗しました:', e);
      }
      return false;
    }
  },

  /**
   * データをバックアップファイルへ書き込む
   * @param {object} data
   * @returns {boolean}
   */
  async saveBackup(data) {
    if (!this.fileHandle) return false;

    try {
      const permission = await this._requestPermission('readwrite');
      if (permission !== 'granted') return false;

      const writable = await this.fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
      return true;
    } catch (e) {
      console.error('バックアップ保存に失敗しました:', e);
      return false;
    }
  },

  /**
   * バックアップファイルからデータを読み込む
   * @returns {object|null}
   */
  async loadBackup() {
    if (!this.fileHandle) return null;

    try {
      const permission = await this._requestPermission('read');
      if (permission !== 'granted') return null;

      const file = await this.fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text);
    } catch (e) {
      console.error('バックアップ読み込みに失敗しました:', e);
      return null;
    }
  },

  /**
   * 現在設定されているバックアップファイル名を返す
   * @returns {string|null}
   */
  getFileName() {
    return this.fileHandle ? this.fileHandle.name : null;
  },

  /**
   * 非対応理由を返す
   * @returns {string|null}
   */
  getUnsupportedReason() {
    return this.unsupportedReason;
  },

  /**
   * バックアップ設定をリセットする
   */
  async clearBackupPath() {
    this.fileHandle = null;
    await this._clearHandle();
  },

  // ─────────────────────────────────────────────────────────
  // プライベートメソッド
  // ─────────────────────────────────────────────────────────

  /**
   * 利用不可の理由を判定する
   * @returns {string|null}
   */
  _detectUnsupportedReason() {
    if (typeof window === 'undefined') return 'no-window';
    if (!window.isSecureContext) return 'insecure-context';
    if (window.top !== window.self) return 'not-top-level';
    if (!('showSaveFilePicker' in window)) return 'api-unavailable';
    if (typeof indexedDB === 'undefined') return 'indexeddb-unavailable';
    return null;
  },

  /**
   * 互換性問題を考慮してファイル保存ダイアログを開く
   * @param {object} options
   * @returns {Promise<FileSystemFileHandle>}
   */
  async _showSaveFilePickerWithFallback(options) {
    try {
      return await window.showSaveFilePicker(options);
    } catch (e) {
      // 一部Edge環境では startIn が TypeError になるため再試行
      if (e?.name === 'TypeError' && options?.startIn) {
        const fallbackOptions = { ...options };
        delete fallbackOptions.startIn;
        return window.showSaveFilePicker(fallbackOptions);
      }
      throw e;
    }
  },

  /**
   * 必要な権限を要求 / 確認する
   * @param {'read'|'readwrite'} mode
   * @returns {PermissionState}
   */
  async _requestPermission(mode) {
    try {
      let state = await this.fileHandle.queryPermission({ mode });
      if (state !== 'granted') {
        state = await this.fileHandle.requestPermission({ mode });
      }
      return state;
    } catch {
      return 'denied';
    }
  },

  /** IndexedDB を開く */
  _openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  /** IndexedDB からハンドルを読む */
  async _loadHandle() {
    try {
      const db = await this._openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const req = tx.objectStore(this.STORE_NAME).get(this.HANDLE_KEY);
        req.onsuccess = () => { db.close(); resolve(req.result || null); };
        req.onerror  = () => { db.close(); resolve(null); };
      });
    } catch {
      return null;
    }
  },

  /** IndexedDB へハンドルを保存 */
  async _saveHandle(handle) {
    try {
      const db = await this._openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        tx.objectStore(this.STORE_NAME).put(handle, this.HANDLE_KEY);
        tx.oncomplete = () => { db.close(); resolve(true); };
        tx.onerror    = () => { db.close(); resolve(false); };
      });
    } catch {
      return false;
    }
  },

  /** IndexedDB からハンドルを削除 */
  async _clearHandle() {
    try {
      const db = await this._openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        tx.objectStore(this.STORE_NAME).delete(this.HANDLE_KEY);
        tx.oncomplete = () => { db.close(); resolve(true); };
        tx.onerror    = () => { db.close(); resolve(false); };
      });
    } catch {
      return false;
    }
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CloudBackup;
}
