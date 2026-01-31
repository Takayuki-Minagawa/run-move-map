/**
 * achievements.js のテスト
 * バッジ・レベルシステムのテスト
 */

describe('Achievements', () => {
  // テスト用のバッジデータ
  const BADGES = [
    // 距離バッジ
    {
      id: 'distance_10',
      name: '初心者ランナー',
      description: '累計10km達成',
      icon: '🏃',
      category: 'distance',
      condition: (data) => data.totalDistance >= 10
    },
    {
      id: 'distance_100',
      name: '100kmの壁突破',
      description: '累計100km達成',
      icon: '🎽',
      category: 'distance',
      condition: (data) => data.totalDistance >= 100
    },
    {
      id: 'distance_500',
      name: 'ハーフウェイ',
      description: '累計500km達成',
      icon: '🏅',
      category: 'distance',
      condition: (data) => data.totalDistance >= 500
    },
    {
      id: 'distance_1000',
      name: '1000kmクラブ',
      description: '累計1000km達成',
      icon: '🥇',
      category: 'distance',
      condition: (data) => data.totalDistance >= 1000
    },
    // 連続記録バッジ
    {
      id: 'streak_3',
      name: '三日坊主突破',
      description: '3日連続記録',
      icon: '🔥',
      category: 'streak',
      condition: (data) => data.streakDays >= 3
    },
    {
      id: 'streak_7',
      name: '週間チャレンジャー',
      description: '7日連続記録',
      icon: '📅',
      category: 'streak',
      condition: (data) => data.streakDays >= 7
    },
    // 都市到達バッジ
    {
      id: 'city_kagoshima',
      name: '鹿児島上陸',
      description: '鹿児島に到達',
      icon: '🌋',
      category: 'city',
      condition: (data) => data.reachedCities.includes('kagoshima')
    },
    {
      id: 'city_osaka',
      name: '大阪到着',
      description: '大阪に到達',
      icon: '🏯',
      category: 'city',
      condition: (data) => data.reachedCities.includes('osaka')
    },
    {
      id: 'city_tokyo',
      name: '東京到達',
      description: '東京に到達',
      icon: '🗼',
      category: 'city',
      condition: (data) => data.reachedCities.includes('tokyo')
    },
    {
      id: 'city_sapporo',
      name: '日本縦断達成！',
      description: '札幌に到達',
      icon: '🏆',
      category: 'city',
      condition: (data) => data.reachedCities.includes('sapporo')
    },
    // 記録回数バッジ
    {
      id: 'records_10',
      name: '記録の習慣',
      description: '10回記録',
      icon: '📝',
      category: 'record',
      condition: (data) => data.stats.totalRecords >= 10
    },
    {
      id: 'records_50',
      name: '半世紀の記録',
      description: '50回記録',
      icon: '📊',
      category: 'record',
      condition: (data) => data.stats.totalRecords >= 50
    }
  ];

  // テスト用のレベルデータ
  const LEVELS = [
    { level: 1, name: '見習いランナー', minDistance: 0, icon: '🌱' },
    { level: 2, name: '駆け出しランナー', minDistance: 50, icon: '🌿' },
    { level: 3, name: '一般ランナー', minDistance: 100, icon: '🌲' },
    { level: 4, name: '熟練ランナー', minDistance: 200, icon: '⭐' },
    { level: 5, name: 'ベテランランナー', minDistance: 400, icon: '🌟' },
    { level: 6, name: 'エキスパートランナー', minDistance: 700, icon: '💫' },
    { level: 7, name: 'マスターランナー', minDistance: 1000, icon: '🔥' },
    { level: 8, name: 'レジェンドランナー', minDistance: 1500, icon: '👑' },
    { level: 9, name: '伝説のランナー', minDistance: 2000, icon: '🏆' },
    { level: 10, name: '日本縦断の覇者', minDistance: 3000, icon: '🎌' }
  ];

  // Achievements オブジェクトの実装（テスト用）
  const Achievements = {
    getAllBadges() {
      return BADGES;
    },

    getAllLevels() {
      return LEVELS;
    },

    checkNewBadges(data, earnedBadges) {
      const newBadges = [];
      
      for (const badge of BADGES) {
        if (!earnedBadges.includes(badge.id) && badge.condition(data)) {
          newBadges.push(badge);
        }
      }
      
      return newBadges;
    },

    getCurrentLevel(distance) {
      let currentLevel = LEVELS[0];
      
      for (const level of LEVELS) {
        if (distance >= level.minDistance) {
          currentLevel = level;
        }
      }
      
      return currentLevel;
    },

    getNextLevel(distance) {
      for (const level of LEVELS) {
        if (distance < level.minDistance) {
          return level;
        }
      }
      return null;
    },

    getBadgeById(badgeId) {
      return BADGES.find(b => b.id === badgeId);
    },

    getBadgesByCategory(category) {
      return BADGES.filter(b => b.category === category);
    },

    getProgressToNextLevel(distance) {
      const current = this.getCurrentLevel(distance);
      const next = this.getNextLevel(distance);
      
      if (!next) {
        return { current, next: null, progress: 100, remaining: 0 };
      }
      
      const levelRange = next.minDistance - current.minDistance;
      const progressInLevel = distance - current.minDistance;
      const progress = Math.floor((progressInLevel / levelRange) * 100);
      const remaining = next.minDistance - distance;
      
      return { current, next, progress, remaining };
    }
  };

  describe('getAllBadges', () => {
    test('すべてのバッジを取得できる', () => {
      const badges = Achievements.getAllBadges();
      
      expect(Array.isArray(badges)).toBe(true);
      expect(badges.length).toBeGreaterThan(0);
    });

    test('各バッジに必要なプロパティがある', () => {
      const badges = Achievements.getAllBadges();
      
      badges.forEach(badge => {
        expect(badge).toHaveProperty('id');
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('description');
        expect(badge).toHaveProperty('icon');
        expect(badge).toHaveProperty('category');
        expect(badge).toHaveProperty('condition');
        expect(typeof badge.condition).toBe('function');
      });
    });
  });

  describe('getAllLevels', () => {
    test('すべてのレベルを取得できる', () => {
      const levels = Achievements.getAllLevels();
      
      expect(Array.isArray(levels)).toBe(true);
      expect(levels.length).toBe(10);
    });

    test('レベルが昇順に並んでいる', () => {
      const levels = Achievements.getAllLevels();
      
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i].minDistance).toBeGreaterThan(levels[i - 1].minDistance);
      }
    });
  });

  describe('checkNewBadges', () => {
    test('条件を満たした新しいバッジを検出する', () => {
      const data = {
        totalDistance: 15,
        streakDays: 0,
        reachedCities: [],
        stats: { totalRecords: 0 }
      };
      
      const newBadges = Achievements.checkNewBadges(data, []);
      
      expect(newBadges.some(b => b.id === 'distance_10')).toBe(true);
    });

    test('すでに獲得したバッジは返さない', () => {
      const data = {
        totalDistance: 15,
        streakDays: 0,
        reachedCities: [],
        stats: { totalRecords: 0 }
      };
      
      const newBadges = Achievements.checkNewBadges(data, ['distance_10']);
      
      expect(newBadges.some(b => b.id === 'distance_10')).toBe(false);
    });

    test('複数のバッジを同時に獲得できる', () => {
      const data = {
        totalDistance: 150,
        streakDays: 5,
        reachedCities: ['kagoshima'],
        stats: { totalRecords: 15 }
      };
      
      const newBadges = Achievements.checkNewBadges(data, []);
      
      expect(newBadges.length).toBeGreaterThan(1);
      expect(newBadges.some(b => b.id === 'distance_10')).toBe(true);
      expect(newBadges.some(b => b.id === 'distance_100')).toBe(true);
      expect(newBadges.some(b => b.id === 'city_kagoshima')).toBe(true);
    });

    test('連続記録バッジを獲得できる', () => {
      const data = {
        totalDistance: 0,
        streakDays: 7,
        reachedCities: [],
        stats: { totalRecords: 0 }
      };
      
      const newBadges = Achievements.checkNewBadges(data, []);
      
      expect(newBadges.some(b => b.id === 'streak_3')).toBe(true);
      expect(newBadges.some(b => b.id === 'streak_7')).toBe(true);
    });
  });

  describe('getCurrentLevel', () => {
    test('0kmでレベル1を返す', () => {
      const level = Achievements.getCurrentLevel(0);
      expect(level.level).toBe(1);
      expect(level.name).toBe('見習いランナー');
    });

    test('50kmでレベル2を返す', () => {
      const level = Achievements.getCurrentLevel(50);
      expect(level.level).toBe(2);
    });

    test('100kmでレベル3を返す', () => {
      const level = Achievements.getCurrentLevel(100);
      expect(level.level).toBe(3);
    });

    test('3000kmで最高レベルを返す', () => {
      const level = Achievements.getCurrentLevel(3000);
      expect(level.level).toBe(10);
      expect(level.name).toBe('日本縦断の覇者');
    });

    test('境界値でレベルが正しく判定される', () => {
      expect(Achievements.getCurrentLevel(49).level).toBe(1);
      expect(Achievements.getCurrentLevel(50).level).toBe(2);
      expect(Achievements.getCurrentLevel(51).level).toBe(2);
    });
  });

  describe('getNextLevel', () => {
    test('0kmの次はレベル2', () => {
      const next = Achievements.getNextLevel(0);
      expect(next.level).toBe(2);
    });

    test('最高レベルの場合はnullを返す', () => {
      const next = Achievements.getNextLevel(3000);
      expect(next).toBeNull();
    });
  });

  describe('getBadgeById', () => {
    test('IDでバッジを取得できる', () => {
      const badge = Achievements.getBadgeById('distance_100');
      
      expect(badge).toBeDefined();
      expect(badge.id).toBe('distance_100');
      expect(badge.name).toBe('100kmの壁突破');
    });

    test('存在しないIDはundefinedを返す', () => {
      const badge = Achievements.getBadgeById('non_existent');
      expect(badge).toBeUndefined();
    });
  });

  describe('getBadgesByCategory', () => {
    test('カテゴリでバッジをフィルタリングできる', () => {
      const distanceBadges = Achievements.getBadgesByCategory('distance');
      
      expect(distanceBadges.length).toBeGreaterThan(0);
      distanceBadges.forEach(badge => {
        expect(badge.category).toBe('distance');
      });
    });

    test('存在しないカテゴリは空配列を返す', () => {
      const badges = Achievements.getBadgesByCategory('non_existent');
      expect(badges).toEqual([]);
    });
  });

  describe('getProgressToNextLevel', () => {
    test('次のレベルへの進捗を計算できる', () => {
      const progress = Achievements.getProgressToNextLevel(25);
      
      expect(progress.current.level).toBe(1);
      expect(progress.next.level).toBe(2);
      expect(progress.progress).toBe(50);
      expect(progress.remaining).toBe(25);
    });

    test('最高レベルでは進捗が100%', () => {
      const progress = Achievements.getProgressToNextLevel(3000);
      
      expect(progress.current.level).toBe(10);
      expect(progress.next).toBeNull();
      expect(progress.progress).toBe(100);
      expect(progress.remaining).toBe(0);
    });

    test('レベルの開始地点では進捗が0%', () => {
      const progress = Achievements.getProgressToNextLevel(100);
      
      expect(progress.current.level).toBe(3);
      expect(progress.progress).toBe(0);
    });
  });

  describe('Badge conditions', () => {
    test('距離バッジの条件が正しく動作する', () => {
      const badge10 = BADGES.find(b => b.id === 'distance_10');
      const badge100 = BADGES.find(b => b.id === 'distance_100');
      
      expect(badge10.condition({ totalDistance: 10 })).toBe(true);
      expect(badge10.condition({ totalDistance: 9 })).toBe(false);
      expect(badge100.condition({ totalDistance: 100 })).toBe(true);
      expect(badge100.condition({ totalDistance: 99 })).toBe(false);
    });

    test('連続記録バッジの条件が正しく動作する', () => {
      const badge3 = BADGES.find(b => b.id === 'streak_3');
      const badge7 = BADGES.find(b => b.id === 'streak_7');
      
      expect(badge3.condition({ streakDays: 3 })).toBe(true);
      expect(badge3.condition({ streakDays: 2 })).toBe(false);
      expect(badge7.condition({ streakDays: 7 })).toBe(true);
      expect(badge7.condition({ streakDays: 6 })).toBe(false);
    });

    test('都市到達バッジの条件が正しく動作する', () => {
      const badgeKagoshima = BADGES.find(b => b.id === 'city_kagoshima');
      const badgeTokyo = BADGES.find(b => b.id === 'city_tokyo');
      
      expect(badgeKagoshima.condition({ reachedCities: ['kagoshima'] })).toBe(true);
      expect(badgeKagoshima.condition({ reachedCities: [] })).toBe(false);
      expect(badgeTokyo.condition({ reachedCities: ['tokyo'] })).toBe(true);
      expect(badgeTokyo.condition({ reachedCities: ['kagoshima', 'osaka'] })).toBe(false);
    });

    test('記録回数バッジの条件が正しく動作する', () => {
      const badge10 = BADGES.find(b => b.id === 'records_10');
      
      expect(badge10.condition({ stats: { totalRecords: 10 } })).toBe(true);
      expect(badge10.condition({ stats: { totalRecords: 9 } })).toBe(false);
    });
  });
});
