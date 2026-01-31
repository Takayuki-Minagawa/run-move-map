/**
 * データ保存・読み込み機能
 * LocalStorageを使用してブラウザにデータを永続化
 */

const STORAGE_KEY = 'japanJourneyTracker';

const Storage = {
  /**
   * デフォルトのデータ構造
   */
  getDefaultData() {
    return {
      // 累計距離
      totalDistance: 0,
      
      // 記録履歴
      records: [],
      
      // 獲得済みバッジID
      earnedBadges: [],
      
      // 到達済み都市ID
      reachedCities: [],
      
      // 連続記録日数
      streakDays: 0,
      
      // 最終記録日
      lastRecordDate: null,
      
      // 統計情報
      stats: {
        totalRunDistance: 0,
        totalWalkDistance: 0,
        totalRecords: 0,
        longestStreak: 0
      },
      
      // 作成日時
      createdAt: new Date().toISOString(),
      
      // 更新日時
      updatedAt: new Date().toISOString()
    };
  },
  
  /**
   * データを保存
   * @param {object} data - 保存するデータ
   */
  save(data) {
    try {
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('データの保存に失敗しました:', e);
      return false;
    }
  },
  
  /**
   * データを読み込み
   * @returns {object} 保存されているデータ、なければデフォルト値
   */
  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // デフォルトデータとマージして新しいプロパティに対応
        return { ...this.getDefaultData(), ...data };
      }
    } catch (e) {
      console.error('データの読み込みに失敗しました:', e);
    }
    return this.getDefaultData();
  },
  
  /**
   * 記録を追加
   * @param {object} record - { date, distance, type }
   * @returns {object} 更新後のデータ
   */
  addRecord(record) {
    const data = this.load();
    
    // レコードにIDを付与
    const newRecord = {
      id: Date.now(),
      date: record.date,
      distance: parseFloat(record.distance),
      type: record.type, // 'run' or 'walk'
      createdAt: new Date().toISOString()
    };
    
    // 履歴に追加
    data.records.push(newRecord);
    
    // 累計距離を更新
    data.totalDistance += newRecord.distance;
    
    // 統計を更新
    data.stats.totalRecords++;
    if (newRecord.type === 'run') {
      data.stats.totalRunDistance += newRecord.distance;
    } else {
      data.stats.totalWalkDistance += newRecord.distance;
    }
    
    // 連続記録日数を更新
    this.updateStreak(data, record.date);
    
    this.save(data);
    return data;
  },
  
  /**
   * 連続記録日数を更新
   */
  updateStreak(data, recordDate) {
    const today = new Date(recordDate);
    today.setHours(0, 0, 0, 0);
    
    if (data.lastRecordDate) {
      const lastDate = new Date(data.lastRecordDate);
      lastDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // 同じ日の記録（連続日数は変わらない）
      } else if (diffDays === 1) {
        // 連続記録
        data.streakDays++;
      } else {
        // 連続が途切れた
        data.streakDays = 1;
      }
    } else {
      // 初回記録
      data.streakDays = 1;
    }
    
    data.lastRecordDate = recordDate;
    
    // 最長連続記録を更新
    if (data.streakDays > data.stats.longestStreak) {
      data.stats.longestStreak = data.streakDays;
    }
  },
  
  /**
   * 記録を削除
   * @param {number} recordId - 削除するレコードのID
   * @returns {object} 更新後のデータ
   */
  deleteRecord(recordId) {
    const data = this.load();
    const recordIndex = data.records.findIndex(r => r.id === recordId);
    
    if (recordIndex !== -1) {
      const record = data.records[recordIndex];
      
      // 累計距離を減算
      data.totalDistance -= record.distance;
      
      // 統計を更新
      data.stats.totalRecords--;
      if (record.type === 'run') {
        data.stats.totalRunDistance -= record.distance;
      } else {
        data.stats.totalWalkDistance -= record.distance;
      }
      
      // 履歴から削除
      data.records.splice(recordIndex, 1);
      
      this.save(data);
    }
    
    return data;
  },
  
  /**
   * 到達した都市を記録
   * @param {string} cityId - 都市ID
   */
  markCityReached(cityId) {
    const data = this.load();
    if (!data.reachedCities.includes(cityId)) {
      data.reachedCities.push(cityId);
      this.save(data);
    }
    return data;
  },
  
  /**
   * バッジを獲得
   * @param {string} badgeId - バッジID
   */
  earnBadge(badgeId) {
    const data = this.load();
    if (!data.earnedBadges.includes(badgeId)) {
      data.earnedBadges.push(badgeId);
      this.save(data);
    }
    return data;
  },
  
  /**
   * JSONでエクスポート
   * @returns {string} JSON文字列
   */
  exportData() {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  },
  
  /**
   * JSONからインポート
   * @param {string} jsonString - JSON文字列
   * @returns {boolean} 成功/失敗
   */
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      // 基本的な検証
      if (typeof data.totalDistance !== 'number' || !Array.isArray(data.records)) {
        throw new Error('Invalid data format');
      }
      this.save(data);
      return true;
    } catch (e) {
      console.error('インポートに失敗しました:', e);
      return false;
    }
  },
  
  /**
   * データをリセット
   */
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    return this.getDefaultData();
  },
  
  /**
   * 週間/月間統計を取得
   */
  getStatistics() {
    const data = this.load();
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    
    const weeklyRecords = data.records.filter(r => new Date(r.date) >= weekAgo);
    const monthlyRecords = data.records.filter(r => new Date(r.date) >= monthAgo);
    
    return {
      weekly: {
        distance: weeklyRecords.reduce((sum, r) => sum + r.distance, 0),
        count: weeklyRecords.length
      },
      monthly: {
        distance: monthlyRecords.reduce((sum, r) => sum + r.distance, 0),
        count: monthlyRecords.length
      },
      total: {
        distance: data.totalDistance,
        count: data.stats.totalRecords,
        runDistance: data.stats.totalRunDistance,
        walkDistance: data.stats.totalWalkDistance
      },
      streak: {
        current: data.streakDays,
        longest: data.stats.longestStreak
      }
    };
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
