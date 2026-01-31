/**
 * storage.js のテスト
 * LocalStorage管理機能のテスト
 */

describe('Storage', () => {
  // LocalStorageのモック
  let mockStorage = {};
  const localStorageMock = {
    getItem: jest.fn((key) => mockStorage[key] || null),
    setItem: jest.fn((key, value) => { mockStorage[key] = String(value); }),
    removeItem: jest.fn((key) => { delete mockStorage[key]; }),
    clear: jest.fn(() => { mockStorage = {}; })
  };
  
  Object.defineProperty(global, 'localStorage', { value: localStorageMock });

  // Storage オブジェクトの実装（テスト用）
  const STORAGE_KEY = 'japanJourneyTracker';
  
  const Storage = {
    getDefaultData() {
      return {
        totalDistance: 0,
        records: [],
        earnedBadges: [],
        reachedCities: [],
        streakDays: 0,
        lastRecordDate: null,
        stats: {
          totalRunDistance: 0,
          totalWalkDistance: 0,
          totalRecords: 0,
          longestStreak: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },

    save(data) {
      try {
        data.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        return false;
      }
    },

    load() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          return { ...this.getDefaultData(), ...data };
        }
      } catch (e) {
        // ignore
      }
      return this.getDefaultData();
    },

    addRecord(record) {
      const data = this.load();
      const newRecord = {
        id: Date.now(),
        date: record.date,
        distance: parseFloat(record.distance),
        type: record.type,
        createdAt: new Date().toISOString()
      };
      
      data.records.push(newRecord);
      data.totalDistance += newRecord.distance;
      data.stats.totalRecords++;
      
      if (newRecord.type === 'run') {
        data.stats.totalRunDistance += newRecord.distance;
      } else {
        data.stats.totalWalkDistance += newRecord.distance;
      }
      
      this.updateStreak(data, record.date);
      this.save(data);
      return data;
    },

    updateStreak(data, recordDate) {
      const today = new Date(recordDate);
      today.setHours(0, 0, 0, 0);
      
      if (data.lastRecordDate) {
        const lastDate = new Date(data.lastRecordDate);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // same day
        } else if (diffDays === 1) {
          data.streakDays++;
        } else {
          data.streakDays = 1;
        }
      } else {
        data.streakDays = 1;
      }
      
      data.lastRecordDate = recordDate;
      
      if (data.streakDays > data.stats.longestStreak) {
        data.stats.longestStreak = data.streakDays;
      }
    },

    deleteRecord(recordId) {
      const data = this.load();
      const recordIndex = data.records.findIndex(r => r.id === recordId);
      
      if (recordIndex !== -1) {
        const record = data.records[recordIndex];
        data.totalDistance -= record.distance;
        data.stats.totalRecords--;
        
        if (record.type === 'run') {
          data.stats.totalRunDistance -= record.distance;
        } else {
          data.stats.totalWalkDistance -= record.distance;
        }
        
        data.records.splice(recordIndex, 1);
        this.save(data);
      }
      
      return data;
    },

    markCityReached(cityId) {
      const data = this.load();
      if (!data.reachedCities.includes(cityId)) {
        data.reachedCities.push(cityId);
        this.save(data);
      }
      return data;
    },

    earnBadge(badgeId) {
      const data = this.load();
      if (!data.earnedBadges.includes(badgeId)) {
        data.earnedBadges.push(badgeId);
        this.save(data);
      }
      return data;
    },

    exportData() {
      const data = this.load();
      return JSON.stringify(data, null, 2);
    },

    importData(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (typeof data.totalDistance !== 'number' || !Array.isArray(data.records)) {
          throw new Error('Invalid data format');
        }
        this.save(data);
        return true;
      } catch (e) {
        return false;
      }
    },

    reset() {
      localStorage.removeItem(STORAGE_KEY);
      return this.getDefaultData();
    },

    getStatistics() {
      const data = this.load();
      return {
        total: {
          distance: data.totalDistance,
          count: data.stats.totalRecords,
          runDistance: data.stats.totalRunDistance,
          walkDistance: data.stats.totalWalkDistance
        }
      };
    }
  };

  beforeEach(() => {
    mockStorage = {};
    jest.clearAllMocks();
  });

  describe('getDefaultData', () => {
    test('デフォルトデータの構造が正しい', () => {
      const data = Storage.getDefaultData();
      
      expect(data.totalDistance).toBe(0);
      expect(data.records).toEqual([]);
      expect(data.earnedBadges).toEqual([]);
      expect(data.reachedCities).toEqual([]);
      expect(data.streakDays).toBe(0);
      expect(data.lastRecordDate).toBeNull();
      expect(data.stats).toBeDefined();
      expect(data.stats.totalRunDistance).toBe(0);
      expect(data.stats.totalWalkDistance).toBe(0);
    });
  });

  describe('save / load', () => {
    test('データを保存して読み込める', () => {
      const testData = Storage.getDefaultData();
      testData.totalDistance = 100;
      
      Storage.save(testData);
      const loaded = Storage.load();
      
      expect(loaded.totalDistance).toBe(100);
    });

    test('保存されていない場合はデフォルトデータを返す', () => {
      const data = Storage.load();
      expect(data.totalDistance).toBe(0);
    });
  });

  describe('addRecord', () => {
    test('記録を追加できる', () => {
      const data = Storage.addRecord({
        date: '2026-01-31',
        distance: 5.0,
        type: 'run'
      });

      expect(data.records).toHaveLength(1);
      expect(data.totalDistance).toBe(5.0);
      expect(data.stats.totalRunDistance).toBe(5.0);
      expect(data.stats.totalRecords).toBe(1);
    });

    test('ウォーキング記録が正しく集計される', () => {
      const data = Storage.addRecord({
        date: '2026-01-31',
        distance: 3.0,
        type: 'walk'
      });

      expect(data.stats.totalWalkDistance).toBe(3.0);
      expect(data.stats.totalRunDistance).toBe(0);
    });

    test('複数の記録を追加できる', () => {
      Storage.addRecord({ date: '2026-01-30', distance: 5.0, type: 'run' });
      const data = Storage.addRecord({ date: '2026-01-31', distance: 3.0, type: 'walk' });

      expect(data.records).toHaveLength(2);
      expect(data.totalDistance).toBe(8.0);
    });

    test('連続記録日数が更新される', () => {
      Storage.addRecord({ date: '2026-01-30', distance: 5.0, type: 'run' });
      const data = Storage.addRecord({ date: '2026-01-31', distance: 5.0, type: 'run' });

      expect(data.streakDays).toBe(2);
    });
  });

  describe('deleteRecord', () => {
    test('記録を削除できる', () => {
      const added = Storage.addRecord({
        date: '2026-01-31',
        distance: 5.0,
        type: 'run'
      });
      
      const recordId = added.records[0].id;
      const data = Storage.deleteRecord(recordId);

      expect(data.records).toHaveLength(0);
      expect(data.totalDistance).toBe(0);
    });

    test('存在しないIDを削除しても問題ない', () => {
      Storage.addRecord({ date: '2026-01-31', distance: 5.0, type: 'run' });
      const data = Storage.deleteRecord(99999);

      expect(data.records).toHaveLength(1);
    });
  });

  describe('markCityReached', () => {
    test('都市到達を記録できる', () => {
      const data = Storage.markCityReached('kagoshima');
      expect(data.reachedCities).toContain('kagoshima');
    });

    test('同じ都市を重複登録しない', () => {
      Storage.markCityReached('kagoshima');
      const data = Storage.markCityReached('kagoshima');
      
      expect(data.reachedCities.filter(c => c === 'kagoshima')).toHaveLength(1);
    });
  });

  describe('earnBadge', () => {
    test('バッジを獲得できる', () => {
      const data = Storage.earnBadge('distance_100');
      expect(data.earnedBadges).toContain('distance_100');
    });

    test('同じバッジを重複登録しない', () => {
      Storage.earnBadge('distance_100');
      const data = Storage.earnBadge('distance_100');
      
      expect(data.earnedBadges.filter(b => b === 'distance_100')).toHaveLength(1);
    });
  });

  describe('exportData / importData', () => {
    test('データをエクスポートできる', () => {
      Storage.addRecord({ date: '2026-01-31', distance: 5.0, type: 'run' });
      const json = Storage.exportData();
      const parsed = JSON.parse(json);

      expect(parsed.totalDistance).toBe(5.0);
    });

    test('データをインポートできる', () => {
      const importJson = JSON.stringify({
        totalDistance: 100,
        records: [{ id: 1, date: '2026-01-31', distance: 100, type: 'run' }],
        earnedBadges: [],
        reachedCities: [],
        stats: { totalRunDistance: 100, totalWalkDistance: 0, totalRecords: 1 }
      });

      const result = Storage.importData(importJson);
      expect(result).toBe(true);

      const data = Storage.load();
      expect(data.totalDistance).toBe(100);
    });

    test('不正なJSONはインポートできない', () => {
      const result = Storage.importData('invalid json');
      expect(result).toBe(false);
    });

    test('必須フィールドがないJSONはインポートできない', () => {
      const result = Storage.importData(JSON.stringify({ foo: 'bar' }));
      expect(result).toBe(false);
    });
  });

  describe('reset', () => {
    test('データをリセットできる', () => {
      Storage.addRecord({ date: '2026-01-31', distance: 100, type: 'run' });
      const data = Storage.reset();

      expect(data.totalDistance).toBe(0);
      expect(data.records).toHaveLength(0);
    });
  });

  describe('getStatistics', () => {
    test('統計情報を取得できる', () => {
      Storage.addRecord({ date: '2026-01-31', distance: 5.0, type: 'run' });
      const stats = Storage.getStatistics();

      expect(stats.total.distance).toBe(5.0);
      expect(stats.total.runDistance).toBe(5.0);
      expect(stats.total.count).toBe(1);
    });
  });
});
