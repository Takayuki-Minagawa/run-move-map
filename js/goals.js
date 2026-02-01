/**
 * 目標設定・ミニチャレンジ機能
 * 個人目標の設定と追跡
 */

const Goals = {
  goalsContainerId: null,
  challengeContainerId: null,
  records: [],
  
  /**
   * 初期化
   * @param {string} goalsContainerId - 目標表示コンテナID
   * @param {string} challengeContainerId - チャレンジ表示コンテナID
   * @param {array} records - 記録データ
   */
  init(goalsContainerId, challengeContainerId, records) {
    this.goalsContainerId = goalsContainerId;
    this.challengeContainerId = challengeContainerId;
    this.records = records || [];
    
    // 目標を読み込み（Storage から、なければデフォルト）
    const savedData = Storage.load();
    const goals = savedData.goals || this.getDefaultGoals();
    const stats = Storage.getStatistics();
    
    // 進捗を計算
    const progress = this.calculateProgress(goals, this.records, stats);
    
    // UIを描画
    this.renderGoalsUI(goalsContainerId, goals, progress);
    
    // チャレンジUIを描画
    const activeChallenge = Storage.getActiveChallenge();
    this.renderChallengeUI(challengeContainerId, this.records, activeChallenge);
    
    // イベントリスナーを設定
    this.setupEventListeners();
  },
  
  /**
   * イベントリスナー設定
   */
  setupEventListeners() {
    // 目標編集ボタン
    const editBtn = document.getElementById('edit-goals-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        const modal = document.getElementById('goals-modal');
        if (modal) modal.classList.add('show');
      });
    }
    
    // チャレンジ開始ボタン
    document.querySelectorAll('.start-challenge-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const challengeId = e.target.dataset.challengeId;
        this.startChallenge(challengeId);
      });
    });
    
    // チャレンジ放棄ボタン
    const abandonBtn = document.getElementById('abandon-challenge-btn');
    if (abandonBtn) {
      abandonBtn.addEventListener('click', () => this.abandonChallenge());
    }
  },
  
  /**
   * チャレンジを開始
   */
  startChallenge(challengeId) {
    const challenges = this.getChallenges();
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const activeChallenge = {
      ...challenge,
      startDate: new Date().toISOString().split('T')[0]
    };
    
    Storage.saveActiveChallenge(activeChallenge);
    this.init(this.goalsContainerId, this.challengeContainerId, this.records);
  },
  
  /**
   * チャレンジを放棄
   */
  abandonChallenge() {
    if (confirm('チャレンジを放棄しますか？')) {
      Storage.saveActiveChallenge(null);
      this.init(this.goalsContainerId, this.challengeContainerId, this.records);
    }
  },
  
  /**
   * デフォルトの目標設定
   */
  getDefaultGoals() {
    return {
      // 月間目標
      monthly: {
        distance: 100,
        enabled: true
      },
      // 週間目標
      weekly: {
        distance: 30,
        enabled: true
      },
      // 連続日数目標
      streak: {
        days: 7,
        enabled: true
      },
      // 回数目標（週）
      frequency: {
        timesPerWeek: 3,
        enabled: true
      }
    };
  },
  
  /**
   * ミニチャレンジの定義
   */
  getChallenges() {
    return [
      {
        id: 'weekly_50',
        name: '週間50kmチャレンジ',
        description: '1週間で50km走破する',
        icon: '🎯',
        duration: 7,
        target: 50,
        type: 'distance',
        difficulty: 'normal'
      },
      {
        id: 'weekly_100',
        name: '週間100kmチャレンジ',
        description: '1週間で100km走破する',
        icon: '🔥',
        duration: 7,
        target: 100,
        type: 'distance',
        difficulty: 'hard'
      },
      {
        id: 'daily_streak_7',
        name: '7日間連続チャレンジ',
        description: '7日連続で記録する',
        icon: '📅',
        duration: 7,
        target: 7,
        type: 'streak',
        difficulty: 'normal'
      },
      {
        id: 'daily_streak_30',
        name: '30日間連続チャレンジ',
        description: '30日連続で記録する',
        icon: '💪',
        duration: 30,
        target: 30,
        type: 'streak',
        difficulty: 'hard'
      },
      {
        id: 'weekend_warrior',
        name: 'ウィークエンドウォリアー',
        description: '週末だけで30km走破',
        icon: '🏃',
        duration: 7,
        target: 30,
        type: 'weekend',
        difficulty: 'normal'
      },
      {
        id: 'morning_runner',
        name: 'モーニングランナー',
        description: '朝（6-9時）に5日間記録',
        icon: '🌅',
        duration: 7,
        target: 5,
        type: 'morning',
        difficulty: 'normal'
      },
      {
        id: 'distance_marathon',
        name: 'マラソンチャレンジ',
        description: '1日でフルマラソン距離（42.195km）',
        icon: '🏅',
        duration: 1,
        target: 42.195,
        type: 'single_day',
        difficulty: 'extreme'
      }
    ];
  },
  
  /**
   * 目標の進捗を計算
   * @param {object} goals - 目標設定
   * @param {array} records - 記録データ
   * @param {object} stats - 統計データ
   */
  calculateProgress(goals, records, stats) {
    const now = new Date();
    const progress = {};
    
    // 月間目標
    if (goals.monthly.enabled) {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthRecords = records.filter(r => new Date(r.date) >= monthStart);
      const monthDistance = monthRecords.reduce((sum, r) => sum + r.distance, 0);
      
      progress.monthly = {
        current: monthDistance,
        target: goals.monthly.distance,
        percent: Math.min((monthDistance / goals.monthly.distance) * 100, 100),
        remaining: Math.max(goals.monthly.distance - monthDistance, 0),
        completed: monthDistance >= goals.monthly.distance
      };
    }
    
    // 週間目標
    if (goals.weekly.enabled) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekRecords = records.filter(r => new Date(r.date) >= weekStart);
      const weekDistance = weekRecords.reduce((sum, r) => sum + r.distance, 0);
      
      progress.weekly = {
        current: weekDistance,
        target: goals.weekly.distance,
        percent: Math.min((weekDistance / goals.weekly.distance) * 100, 100),
        remaining: Math.max(goals.weekly.distance - weekDistance, 0),
        completed: weekDistance >= goals.weekly.distance
      };
    }
    
    // 連続日数目標
    if (goals.streak.enabled) {
      progress.streak = {
        current: stats.streak?.current || 0,
        target: goals.streak.days,
        percent: Math.min((stats.streak?.current || 0) / goals.streak.days * 100, 100),
        remaining: Math.max(goals.streak.days - (stats.streak?.current || 0), 0),
        completed: (stats.streak?.current || 0) >= goals.streak.days
      };
    }
    
    // 週間回数目標
    if (goals.frequency.enabled) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekRecords = records.filter(r => new Date(r.date) >= weekStart);
      const uniqueDays = new Set(weekRecords.map(r => r.date)).size;
      
      progress.frequency = {
        current: uniqueDays,
        target: goals.frequency.timesPerWeek,
        percent: Math.min((uniqueDays / goals.frequency.timesPerWeek) * 100, 100),
        remaining: Math.max(goals.frequency.timesPerWeek - uniqueDays, 0),
        completed: uniqueDays >= goals.frequency.timesPerWeek
      };
    }
    
    return progress;
  },
  
  /**
   * アクティブなチャレンジの進捗を計算
   * @param {object} activeChallenge - アクティブなチャレンジ
   * @param {array} records - 記録データ
   */
  calculateChallengeProgress(activeChallenge, records) {
    if (!activeChallenge) return null;
    
    const challenge = this.getChallenges().find(c => c.id === activeChallenge.challengeId);
    if (!challenge) return null;
    
    const startDate = new Date(activeChallenge.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + challenge.duration);
    
    const now = new Date();
    const isExpired = now > endDate;
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    
    // チャレンジ期間中の記録を取得
    const challengeRecords = records.filter(r => {
      const date = new Date(r.date);
      return date >= startDate && date <= endDate;
    });
    
    let current = 0;
    let completed = false;
    
    switch (challenge.type) {
      case 'distance':
        current = challengeRecords.reduce((sum, r) => sum + r.distance, 0);
        completed = current >= challenge.target;
        break;
        
      case 'streak':
        // 連続日数をカウント
        const dates = [...new Set(challengeRecords.map(r => r.date))].sort();
        let streak = 0;
        let maxStreak = 0;
        let prevDate = null;
        
        dates.forEach(dateStr => {
          const date = new Date(dateStr);
          if (prevDate) {
            const diff = (date - prevDate) / (1000 * 60 * 60 * 24);
            if (diff === 1) {
              streak++;
            } else {
              streak = 1;
            }
          } else {
            streak = 1;
          }
          maxStreak = Math.max(maxStreak, streak);
          prevDate = date;
        });
        
        current = maxStreak;
        completed = current >= challenge.target;
        break;
        
      case 'weekend':
        // 週末の記録のみカウント
        const weekendRecords = challengeRecords.filter(r => {
          const day = new Date(r.date).getDay();
          return day === 0 || day === 6;
        });
        current = weekendRecords.reduce((sum, r) => sum + r.distance, 0);
        completed = current >= challenge.target;
        break;
        
      case 'single_day':
        // 1日の最大距離
        const dayTotals = {};
        challengeRecords.forEach(r => {
          if (!dayTotals[r.date]) dayTotals[r.date] = 0;
          dayTotals[r.date] += r.distance;
        });
        current = Math.max(0, ...Object.values(dayTotals));
        completed = current >= challenge.target;
        break;
        
      default:
        current = challengeRecords.length;
        completed = current >= challenge.target;
    }
    
    return {
      challenge,
      startDate: activeChallenge.startDate,
      endDate: endDate.toISOString().split('T')[0],
      current,
      target: challenge.target,
      percent: Math.min((current / challenge.target) * 100, 100),
      daysRemaining,
      isExpired,
      completed
    };
  },
  
  /**
   * 目標設定UIを描画
   * @param {string} containerId - コンテナ要素のID
   * @param {object} goals - 現在の目標設定
   * @param {object} progress - 進捗データ
   */
  renderGoalsUI(containerId, goals, progress) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="goals-container">';
    
    // 月間目標
    if (goals.monthly.enabled && progress.monthly) {
      html += this.renderGoalCard('monthly', '📅 月間目標', goals.monthly.distance, progress.monthly, 'km');
    }
    
    // 週間目標
    if (goals.weekly.enabled && progress.weekly) {
      html += this.renderGoalCard('weekly', '📆 週間目標', goals.weekly.distance, progress.weekly, 'km');
    }
    
    // 連続日数目標
    if (goals.streak.enabled && progress.streak) {
      html += this.renderGoalCard('streak', '🔥 連続日数', goals.streak.days, progress.streak, '日');
    }
    
    // 週間回数目標
    if (goals.frequency.enabled && progress.frequency) {
      html += this.renderGoalCard('frequency', '🎯 週間回数', goals.frequency.timesPerWeek, progress.frequency, '回');
    }
    
    html += '</div>';
    
    // 目標設定ボタン
    html += `
      <button class="edit-goals-btn" id="edit-goals-btn">
        ⚙️ 目標を編集
      </button>
    `;
    
    container.innerHTML = html;
  },
  
  /**
   * 目標カードのHTMLを生成
   */
  renderGoalCard(type, title, target, progress, unit) {
    const statusClass = progress.completed ? 'completed' : (progress.percent >= 50 ? 'on-track' : 'behind');
    
    return `
      <div class="goal-card ${statusClass}" data-goal-type="${type}">
        <div class="goal-header">
          <span class="goal-title">${title}</span>
          ${progress.completed ? '<span class="goal-badge">✓ 達成！</span>' : ''}
        </div>
        <div class="goal-progress">
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width: ${progress.percent}%"></div>
          </div>
          <div class="goal-stats">
            <span class="goal-current">${progress.current.toFixed(1)}${unit}</span>
            <span class="goal-separator">/</span>
            <span class="goal-target">${target}${unit}</span>
          </div>
        </div>
        ${!progress.completed ? `<div class="goal-remaining">残り ${progress.remaining.toFixed(1)}${unit}</div>` : ''}
      </div>
    `;
  },
  
  /**
   * チャレンジ選択UIを描画
   */
  renderChallengeSelector(containerId, activeChallenge, challengeProgress) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const challenges = this.getChallenges();
    let html = '';
    
    // アクティブなチャレンジがある場合
    if (activeChallenge && challengeProgress) {
      const difficultyColors = {
        normal: '#4ecdc4',
        hard: '#ff6b6b',
        extreme: '#9b59b6'
      };
      
      html = `
        <div class="active-challenge">
          <div class="challenge-icon">${challengeProgress.challenge.icon}</div>
          <div class="challenge-info">
            <h4>${challengeProgress.challenge.name}</h4>
            <p>${challengeProgress.challenge.description}</p>
            <div class="challenge-progress-bar">
              <div class="challenge-progress-fill" style="width: ${challengeProgress.percent}%"></div>
            </div>
            <div class="challenge-stats">
              <span>${challengeProgress.current.toFixed(1)} / ${challengeProgress.target}</span>
              <span>残り ${challengeProgress.daysRemaining}日</span>
            </div>
          </div>
          ${challengeProgress.completed ? 
            '<div class="challenge-completed">🎉 チャレンジ達成！</div>' : 
            '<button class="abandon-challenge-btn" id="abandon-challenge">中断する</button>'
          }
        </div>
      `;
    } else {
      // チャレンジ選択
      html = `
        <div class="challenge-selector">
          <h4>🏆 ミニチャレンジを選択</h4>
          <div class="challenge-list">
      `;
      
      challenges.forEach(challenge => {
        const difficultyLabel = {
          normal: '普通',
          hard: '難しい',
          extreme: '超難関'
        };
        
        html += `
          <div class="challenge-option" data-challenge-id="${challenge.id}">
            <span class="challenge-icon">${challenge.icon}</span>
            <div class="challenge-details">
              <span class="challenge-name">${challenge.name}</span>
              <span class="challenge-desc">${challenge.description}</span>
              <span class="challenge-difficulty ${challenge.difficulty}">${difficultyLabel[challenge.difficulty]}</span>
            </div>
            <button class="start-challenge-btn" data-challenge-id="${challenge.id}">開始</button>
          </div>
        `;
      });
      
      html += '</div></div>';
    }
    
    container.innerHTML = html;
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Goals;
}
