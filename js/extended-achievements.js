/**
 * 詳細実績システム
 * より多様なバッジと実績トラッキング
 */

// 追加バッジ定義
const EXTENDED_BADGES = [
  // ========== 時間帯バッジ ==========
  {
    id: 'early_bird',
    name: 'アーリーバード',
    description: '朝6時前に記録を5回',
    icon: '🌅',
    condition: (data) => {
      const earlyRecords = data.records.filter(r => {
        const hour = new Date(r.createdAt).getHours();
        return hour < 6;
      });
      return earlyRecords.length >= 5;
    },
    category: 'time'
  },
  {
    id: 'night_owl',
    name: 'ナイトオウル',
    description: '夜22時以降に記録を5回',
    icon: '🦉',
    condition: (data) => {
      const nightRecords = data.records.filter(r => {
        const hour = new Date(r.createdAt).getHours();
        return hour >= 22;
      });
      return nightRecords.length >= 5;
    },
    category: 'time'
  },
  
  // ========== 天候・季節バッジ ==========
  {
    id: 'new_year_runner',
    name: 'ニューイヤーランナー',
    description: '元日に記録',
    icon: '🎍',
    condition: (data) => {
      return data.records.some(r => {
        const date = new Date(r.date);
        return date.getMonth() === 0 && date.getDate() === 1;
      });
    },
    category: 'special'
  },
  {
    id: 'christmas_runner',
    name: 'クリスマスランナー',
    description: 'クリスマスに記録',
    icon: '🎄',
    condition: (data) => {
      return data.records.some(r => {
        const date = new Date(r.date);
        return date.getMonth() === 11 && date.getDate() === 25;
      });
    },
    category: 'special'
  },
  {
    id: 'birthday_runner',
    name: 'バースデーランナー',
    description: '自分の誕生日に記録',
    icon: '🎂',
    condition: (data) => {
      if (!data.settings?.birthday) return false;
      const birthday = data.settings.birthday;
      return data.records.some(r => {
        const date = new Date(r.date);
        const bday = new Date(birthday);
        return date.getMonth() === bday.getMonth() && date.getDate() === bday.getDate();
      });
    },
    category: 'special'
  },
  
  // ========== 距離チャレンジバッジ ==========
  {
    id: 'single_10k',
    name: '10Kランナー',
    description: '1日で10km以上を記録',
    icon: '🏃‍♂️',
    condition: (data) => {
      const dailyTotals = {};
      data.records.forEach(r => {
        if (!dailyTotals[r.date]) dailyTotals[r.date] = 0;
        dailyTotals[r.date] += r.distance;
      });
      return Object.values(dailyTotals).some(d => d >= 10);
    },
    category: 'challenge'
  },
  {
    id: 'single_half',
    name: 'ハーフマラソニスト',
    description: '1日で21.1km以上を記録',
    icon: '🎽',
    condition: (data) => {
      const dailyTotals = {};
      data.records.forEach(r => {
        if (!dailyTotals[r.date]) dailyTotals[r.date] = 0;
        dailyTotals[r.date] += r.distance;
      });
      return Object.values(dailyTotals).some(d => d >= 21.1);
    },
    category: 'challenge'
  },
  {
    id: 'single_full',
    name: 'フルマラソニスト',
    description: '1日で42.195km以上を記録',
    icon: '🥇',
    condition: (data) => {
      const dailyTotals = {};
      data.records.forEach(r => {
        if (!dailyTotals[r.date]) dailyTotals[r.date] = 0;
        dailyTotals[r.date] += r.distance;
      });
      return Object.values(dailyTotals).some(d => d >= 42.195);
    },
    category: 'challenge'
  },
  {
    id: 'single_ultra',
    name: 'ウルトラランナー',
    description: '1日で100km以上を記録',
    icon: '🦸',
    condition: (data) => {
      const dailyTotals = {};
      data.records.forEach(r => {
        if (!dailyTotals[r.date]) dailyTotals[r.date] = 0;
        dailyTotals[r.date] += r.distance;
      });
      return Object.values(dailyTotals).some(d => d >= 100);
    },
    category: 'challenge'
  },
  
  // ========== 継続バッジ ==========
  {
    id: 'weekend_warrior',
    name: 'ウィークエンドウォリアー',
    description: '4週連続で週末に記録',
    icon: '⚔️',
    condition: (data) => {
      // 週末の記録をチェック
      const weekendRecords = data.records.filter(r => {
        const day = new Date(r.date).getDay();
        return day === 0 || day === 6;
      });
      
      // 週ごとにグループ化
      const weeks = {};
      weekendRecords.forEach(r => {
        const date = new Date(r.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        weeks[weekKey] = true;
      });
      
      // 連続週をカウント
      const sortedWeeks = Object.keys(weeks).sort();
      let consecutive = 0;
      let maxConsecutive = 0;
      
      for (let i = 0; i < sortedWeeks.length; i++) {
        if (i === 0) {
          consecutive = 1;
        } else {
          const prev = new Date(sortedWeeks[i - 1]);
          const curr = new Date(sortedWeeks[i]);
          const diff = (curr - prev) / (1000 * 60 * 60 * 24);
          
          if (diff === 7) {
            consecutive++;
          } else {
            consecutive = 1;
          }
        }
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      }
      
      return maxConsecutive >= 4;
    },
    category: 'streak'
  },
  {
    id: 'monthly_100',
    name: 'マンスリー100',
    description: '1ヶ月で100km達成',
    icon: '📊',
    condition: (data) => {
      const monthlyTotals = {};
      data.records.forEach(r => {
        const date = new Date(r.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0;
        monthlyTotals[monthKey] += r.distance;
      });
      return Object.values(monthlyTotals).some(d => d >= 100);
    },
    category: 'distance'
  },
  {
    id: 'monthly_200',
    name: 'マンスリー200',
    description: '1ヶ月で200km達成',
    icon: '📈',
    condition: (data) => {
      const monthlyTotals = {};
      data.records.forEach(r => {
        const date = new Date(r.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthlyTotals[monthKey]) monthlyTotals[monthKey] = 0;
        monthlyTotals[monthKey] += r.distance;
      });
      return Object.values(monthlyTotals).some(d => d >= 200);
    },
    category: 'distance'
  },
  
  // ========== 多様性バッジ ==========
  {
    id: 'balanced_runner',
    name: 'バランスランナー',
    description: 'ランとウォークを両方50km以上',
    icon: '⚖️',
    condition: (data) => {
      return data.stats.totalRunDistance >= 50 && data.stats.totalWalkDistance >= 50;
    },
    category: 'variety'
  },
  {
    id: 'all_weekdays',
    name: '全曜日制覇',
    description: '全ての曜日で記録',
    icon: '📅',
    condition: (data) => {
      const days = new Set();
      data.records.forEach(r => {
        days.add(new Date(r.date).getDay());
      });
      return days.size === 7;
    },
    category: 'variety'
  },
  {
    id: 'all_months',
    name: '全月制覇',
    description: '全ての月で記録（1年かけて）',
    icon: '🗓️',
    condition: (data) => {
      const months = new Set();
      data.records.forEach(r => {
        months.add(new Date(r.date).getMonth());
      });
      return months.size === 12;
    },
    category: 'variety'
  },
  
  // ========== シークレットバッジ ==========
  {
    id: 'secret_42',
    name: '人生、宇宙、すべての答え',
    description: '累計が42kmちょうどの時に記録',
    icon: '🌌',
    condition: (data) => {
      let cumulative = 0;
      for (const r of data.records) {
        cumulative += r.distance;
        if (Math.abs(cumulative - 42) < 0.01) return true;
      }
      return false;
    },
    category: 'secret',
    hidden: true
  },
  {
    id: 'secret_lucky',
    name: 'ラッキーセブン',
    description: '7.77kmを記録',
    icon: '🍀',
    condition: (data) => {
      return data.records.some(r => Math.abs(r.distance - 7.77) < 0.01);
    },
    category: 'secret',
    hidden: true
  },
  {
    id: 'secret_palindrome',
    name: 'パリンドローム',
    description: '回文数の距離を記録（例：12.21km）',
    icon: '🔄',
    condition: (data) => {
      return data.records.some(r => {
        const str = r.distance.toFixed(2).replace('.', '');
        return str === str.split('').reverse().join('');
      });
    },
    category: 'secret',
    hidden: true
  }
];

/**
 * 拡張実績システム
 */
const ExtendedAchievements = {
  /**
   * 全てのバッジを取得（基本 + 拡張）
   */
  getAllBadges() {
    // 基本のBADGESが存在する場合はマージ
    const baseBadges = typeof BADGES !== 'undefined' ? BADGES : [];
    return [...baseBadges, ...EXTENDED_BADGES];
  },
  
  /**
   * 新たに獲得したバッジをチェック（拡張版含む）
   */
  checkNewBadges(data) {
    const allBadges = this.getAllBadges();
    const newBadges = [];
    
    for (const badge of allBadges) {
      if (!data.earnedBadges.includes(badge.id) && badge.condition(data)) {
        newBadges.push(badge);
      }
    }
    
    return newBadges;
  },
  
  /**
   * カテゴリ別にバッジを取得
   */
  getBadgesByCategory(earnedBadgeIds) {
    const allBadges = this.getAllBadges();
    const categories = {
      distance: { name: '🏃 距離達成', badges: [] },
      streak: { name: '🔥 連続記録', badges: [] },
      records: { name: '📝 記録回数', badges: [] },
      city: { name: '🗺️ 都市到達', badges: [] },
      time: { name: '⏰ 時間帯', badges: [] },
      special: { name: '🎉 特別な日', badges: [] },
      challenge: { name: '🏆 チャレンジ', badges: [] },
      variety: { name: '🎨 多様性', badges: [] },
      secret: { name: '🔮 シークレット', badges: [] }
    };
    
    allBadges.forEach(badge => {
      const earned = earnedBadgeIds.includes(badge.id);
      // 未獲得のシークレットバッジは非表示
      if (badge.hidden && !earned) return;
      
      if (categories[badge.category]) {
        categories[badge.category].badges.push({
          ...badge,
          earned
        });
      }
    });
    
    return categories;
  },
  
  /**
   * 統計情報を取得
   */
  getAchievementStats(earnedBadgeIds) {
    const allBadges = this.getAllBadges();
    const visibleBadges = allBadges.filter(b => !b.hidden || earnedBadgeIds.includes(b.id));
    const earnedCount = earnedBadgeIds.length;
    
    return {
      total: visibleBadges.length,
      earned: earnedCount,
      percent: visibleBadges.length > 0 ? (earnedCount / visibleBadges.length * 100).toFixed(1) : 0,
      secretFound: allBadges.filter(b => b.hidden && earnedBadgeIds.includes(b.id)).length,
      secretTotal: allBadges.filter(b => b.hidden).length
    };
  },
  
  /**
   * 次に獲得しやすいバッジを提案
   */
  getSuggestedBadges(data) {
    const allBadges = this.getAllBadges();
    const suggestions = [];
    
    allBadges.forEach(badge => {
      if (data.earnedBadges.includes(badge.id) || badge.hidden) return;
      
      // 進捗を推定（簡易的）
      let progress = 0;
      
      if (badge.category === 'distance') {
        const match = badge.id.match(/distance_(\d+)/);
        if (match) {
          progress = Math.min((data.totalDistance / parseInt(match[1])) * 100, 99);
        }
      } else if (badge.category === 'streak') {
        const match = badge.id.match(/streak_(\d+)/);
        if (match) {
          progress = Math.min((data.streakDays / parseInt(match[1])) * 100, 99);
        }
      } else if (badge.category === 'records') {
        const match = badge.id.match(/records_(\d+)/);
        if (match) {
          progress = Math.min((data.stats.totalRecords / parseInt(match[1])) * 100, 99);
        }
      }
      
      if (progress > 50) {
        suggestions.push({ badge, progress });
      }
    });
    
    return suggestions.sort((a, b) => b.progress - a.progress).slice(0, 3);
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExtendedAchievements, EXTENDED_BADGES };
}
