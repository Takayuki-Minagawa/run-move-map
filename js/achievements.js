/**
 * 実績・バッジシステム
 * 達成感を高めるためのゲーミフィケーション機能
 */

const BADGES = [
  // 距離達成バッジ
  {
    id: 'distance_10',
    name: 'ファーストステップ',
    description: '累計10kmを達成',
    icon: '👣',
    condition: (data) => data.totalDistance >= 10,
    category: 'distance'
  },
  {
    id: 'distance_50',
    name: 'ウォーキングビギナー',
    description: '累計50kmを達成',
    icon: '🚶',
    condition: (data) => data.totalDistance >= 50,
    category: 'distance'
  },
  {
    id: 'distance_100',
    name: 'センチュリーランナー',
    description: '累計100kmを達成',
    icon: '💯',
    condition: (data) => data.totalDistance >= 100,
    category: 'distance'
  },
  {
    id: 'distance_300',
    name: 'マラソンマスター',
    description: '累計300kmを達成',
    icon: '🏃',
    condition: (data) => data.totalDistance >= 300,
    category: 'distance'
  },
  {
    id: 'distance_500',
    name: 'ハーフウェイヒーロー',
    description: '累計500kmを達成',
    icon: '🎯',
    condition: (data) => data.totalDistance >= 500,
    category: 'distance'
  },
  {
    id: 'distance_1000',
    name: 'サウザンドマイラー',
    description: '累計1000kmを達成',
    icon: '🌟',
    condition: (data) => data.totalDistance >= 1000,
    category: 'distance'
  },
  {
    id: 'distance_2000',
    name: 'レジェンドトラベラー',
    description: '累計2000kmを達成',
    icon: '👑',
    condition: (data) => data.totalDistance >= 2000,
    category: 'distance'
  },
  {
    id: 'distance_3000',
    name: '日本縦断達成',
    description: '3000km！日本縦断完了！',
    icon: '🏆',
    condition: (data) => data.totalDistance >= 3000,
    category: 'distance'
  },
  
  // 連続記録バッジ
  {
    id: 'streak_3',
    name: 'スリーデイズ',
    description: '3日連続で記録',
    icon: '🔥',
    condition: (data) => data.streakDays >= 3,
    category: 'streak'
  },
  {
    id: 'streak_7',
    name: 'ウィークリーウォリアー',
    description: '7日連続で記録',
    icon: '📅',
    condition: (data) => data.streakDays >= 7,
    category: 'streak'
  },
  {
    id: 'streak_14',
    name: 'トゥーウィークス',
    description: '14日連続で記録',
    icon: '⚡',
    condition: (data) => data.streakDays >= 14,
    category: 'streak'
  },
  {
    id: 'streak_30',
    name: 'マンスリーマスター',
    description: '30日連続で記録',
    icon: '🎖️',
    condition: (data) => data.streakDays >= 30,
    category: 'streak'
  },
  {
    id: 'streak_100',
    name: 'アイアンウィル',
    description: '100日連続で記録',
    icon: '💎',
    condition: (data) => data.streakDays >= 100,
    category: 'streak'
  },
  
  // 記録回数バッジ
  {
    id: 'records_10',
    name: 'ルーキー記録者',
    description: '10回記録',
    icon: '📝',
    condition: (data) => data.stats.totalRecords >= 10,
    category: 'records'
  },
  {
    id: 'records_50',
    name: '記録マニア',
    description: '50回記録',
    icon: '📊',
    condition: (data) => data.stats.totalRecords >= 50,
    category: 'records'
  },
  {
    id: 'records_100',
    name: 'ロガーエリート',
    description: '100回記録',
    icon: '🏅',
    condition: (data) => data.stats.totalRecords >= 100,
    category: 'records'
  },
  
  // 都市到達バッジ
  {
    id: 'city_kagoshima',
    name: '九州上陸',
    description: '鹿児島に到達',
    icon: '🌋',
    condition: (data) => data.reachedCities.includes('kagoshima'),
    category: 'city'
  },
  {
    id: 'city_osaka',
    name: '大阪到着',
    description: '大阪に到達',
    icon: '🏯',
    condition: (data) => data.reachedCities.includes('osaka'),
    category: 'city'
  },
  {
    id: 'city_tokyo',
    name: '首都制覇',
    description: '東京に到達',
    icon: '🗼',
    condition: (data) => data.reachedCities.includes('tokyo'),
    category: 'city'
  },
  {
    id: 'city_sapporo',
    name: '北の大地',
    description: '札幌に到達（ゴール！）',
    icon: '⛄',
    condition: (data) => data.reachedCities.includes('sapporo'),
    category: 'city'
  }
];

// レベルシステム
const LEVELS = [
  { level: 1, name: '初心者トラベラー', minDistance: 0, icon: '🐣' },
  { level: 2, name: 'ウォーキング見習い', minDistance: 50, icon: '🚶' },
  { level: 3, name: 'アクティブウォーカー', minDistance: 150, icon: '🏃' },
  { level: 4, name: 'マラソンランナー', minDistance: 300, icon: '🎽' },
  { level: 5, name: 'ロードトラベラー', minDistance: 500, icon: '🛤️' },
  { level: 6, name: 'アドベンチャラー', minDistance: 800, icon: '🎒' },
  { level: 7, name: 'エクスプローラー', minDistance: 1200, icon: '🧭' },
  { level: 8, name: 'ジャーニーマスター', minDistance: 1800, icon: '🗺️' },
  { level: 9, name: 'グランドトラベラー', minDistance: 2500, icon: '✨' },
  { level: 10, name: '日本縦断マスター', minDistance: 3000, icon: '👑' }
];

const Achievements = {
  /**
   * 新たに獲得したバッジをチェック
   * @param {object} data - ストレージデータ
   * @returns {array} 新規獲得バッジの配列
   */
  checkNewBadges(data) {
    const newBadges = [];
    
    for (const badge of BADGES) {
      // まだ獲得していない & 条件を満たしている
      if (!data.earnedBadges.includes(badge.id) && badge.condition(data)) {
        newBadges.push(badge);
      }
    }
    
    return newBadges;
  },
  
  /**
   * 獲得済みバッジを取得
   * @param {array} earnedBadgeIds - 獲得済みバッジIDの配列
   * @returns {array} バッジオブジェクトの配列
   */
  getEarnedBadges(earnedBadgeIds) {
    return BADGES.filter(badge => earnedBadgeIds.includes(badge.id));
  },
  
  /**
   * 全バッジを取得（獲得状態付き）
   * @param {array} earnedBadgeIds - 獲得済みバッジIDの配列
   * @returns {array} バッジオブジェクトの配列（earned: true/false付き）
   */
  getAllBadges(earnedBadgeIds) {
    return BADGES.map(badge => ({
      ...badge,
      earned: earnedBadgeIds.includes(badge.id)
    }));
  },
  
  /**
   * 現在のレベルを取得
   * @param {number} totalDistance - 累計距離
   * @returns {object} レベル情報
   */
  getCurrentLevel(totalDistance) {
    let currentLevel = LEVELS[0];
    let nextLevel = LEVELS[1];
    
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalDistance >= LEVELS[i].minDistance) {
        currentLevel = LEVELS[i];
        nextLevel = LEVELS[i + 1] || null;
        break;
      }
    }
    
    const progress = nextLevel 
      ? ((totalDistance - currentLevel.minDistance) / (nextLevel.minDistance - currentLevel.minDistance)) * 100
      : 100;
    
    return {
      current: currentLevel,
      next: nextLevel,
      progress: Math.min(progress, 100),
      distanceToNext: nextLevel ? nextLevel.minDistance - totalDistance : 0
    };
  },
  
  /**
   * 全レベル一覧を取得
   */
  getAllLevels() {
    return LEVELS;
  },
  
  /**
   * バッジカテゴリ別に取得
   */
  getBadgesByCategory() {
    const categories = {
      distance: { name: '距離達成', badges: [] },
      streak: { name: '連続記録', badges: [] },
      records: { name: '記録回数', badges: [] },
      city: { name: '都市到達', badges: [] }
    };
    
    for (const badge of BADGES) {
      if (categories[badge.category]) {
        categories[badge.category].badges.push(badge);
      }
    }
    
    return categories;
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Achievements, BADGES, LEVELS };
}
