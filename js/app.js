/**
 * メインアプリケーションロジック
 */

const App = {
  data: null,
  
  /**
   * アプリ初期化
   */
  async init() {
    // データ読み込み
    this.data = Storage.load();
    
    // 地図初期化
    await JapanMap.init('map-container');
    
    // UI初期化
    this.initForm();
    this.initEventListeners();
    
    // 表示更新
    this.updateUI();
    
    // 初回訪問メッセージ
    if (this.data.records.length === 0) {
      this.showWelcomeMessage();
    }
    
    console.log('🗾 日本縦断チャレンジ アプリ起動完了！');
  },
  
  /**
   * フォーム初期化
   */
  initForm() {
    const dateInput = document.getElementById('record-date');
    if (dateInput) {
      // 今日の日付をデフォルトに
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  },
  
  /**
   * イベントリスナー設定
   */
  initEventListeners() {
    // 記録フォーム送信
    const form = document.getElementById('record-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
    
    // エクスポート/インポート
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }
    
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => this.importData());
    }
    
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetData());
    }
    
    // モーダル閉じる
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
      el.addEventListener('click', () => this.closeModal());
    });
  },
  
  /**
   * 記録フォーム送信処理
   */
  handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const date = form.querySelector('#record-date').value;
    const distance = parseFloat(form.querySelector('#record-distance').value);
    const type = form.querySelector('input[name="type"]:checked').value;
    
    if (!date || isNaN(distance) || distance <= 0) {
      this.showToast('日付と距離を正しく入力してください', 'error');
      return;
    }
    
    // 記録前の累計距離を保存
    const oldDistance = this.data.totalDistance;
    
    // 記録を追加
    this.data = Storage.addRecord({ date, distance, type });
    
    // 新たに到達した都市をチェック
    const newCities = getNewlyReachedCities(oldDistance, this.data.totalDistance);
    newCities.forEach(city => {
      Storage.markCityReached(city.id);
      this.data.reachedCities.push(city.id);
      this.showCityReachedModal(city);
      JapanMap.animateCityReached(city.id);
    });
    
    // 新たに獲得したバッジをチェック
    const newBadges = Achievements.checkNewBadges(this.data);
    newBadges.forEach(badge => {
      Storage.earnBadge(badge.id);
      this.data.earnedBadges.push(badge.id);
      this.showBadgeEarnedToast(badge);
    });
    
    // 完走チェック
    if (this.data.totalDistance >= 3000 && oldDistance < 3000) {
      this.showGoalModal();
      JapanMap.celebrateGoal();
    }
    
    // UI更新
    this.updateUI();
    
    // フォームリセット
    form.querySelector('#record-distance').value = '';
    
    // 成功メッセージ
    this.showToast(`${distance}km を記録しました！ ${type === 'run' ? '🏃' : '🚶'}`, 'success');
  },
  
  /**
   * UI全体を更新
   */
  updateUI() {
    this.updateStats();
    this.updateProgress();
    this.updateMap();
    this.updateHistory();
    this.updateBadges();
    this.updateLevel();
  },
  
  /**
   * 統計表示を更新
   */
  updateStats() {
    const stats = Storage.getStatistics();
    
    // 累計距離
    const totalEl = document.getElementById('total-distance');
    if (totalEl) {
      totalEl.textContent = this.data.totalDistance.toFixed(1);
    }
    
    // 連続日数
    const streakEl = document.getElementById('streak-days');
    if (streakEl) {
      streakEl.textContent = this.data.streakDays;
    }
    
    // 週間距離
    const weeklyEl = document.getElementById('weekly-distance');
    if (weeklyEl) {
      weeklyEl.textContent = stats.weekly.distance.toFixed(1);
    }
    
    // 月間距離
    const monthlyEl = document.getElementById('monthly-distance');
    if (monthlyEl) {
      monthlyEl.textContent = stats.monthly.distance.toFixed(1);
    }
    
    // 記録回数
    const recordsEl = document.getElementById('total-records');
    if (recordsEl) {
      recordsEl.textContent = stats.total.count;
    }
  },
  
  /**
   * 進捗表示を更新
   */
  updateProgress() {
    const location = getLocationByDistance(this.data.totalDistance);
    
    // 現在地
    const currentCityEl = document.getElementById('current-city');
    if (currentCityEl) {
      currentCityEl.textContent = location.currentCity.name;
    }
    
    // 次の目的地
    const nextCityEl = document.getElementById('next-city');
    const nextDistanceEl = document.getElementById('next-distance');
    if (nextCityEl && nextDistanceEl) {
      if (location.nextCity) {
        nextCityEl.textContent = location.nextCity.name;
        nextDistanceEl.textContent = location.distanceToNext.toFixed(1);
      } else {
        nextCityEl.textContent = '🎉 ゴール！';
        nextDistanceEl.textContent = '0';
      }
    }
    
    // 進捗バー
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-percent');
    if (progressBar) {
      progressBar.style.width = `${location.progress}%`;
    }
    if (progressText) {
      progressText.textContent = location.progress.toFixed(1);
    }
    
    // 区間進捗バー
    const segmentBar = document.getElementById('segment-bar');
    if (segmentBar && location.segmentProgress !== undefined) {
      segmentBar.style.width = `${location.segmentProgress}%`;
    }
  },
  
  /**
   * 地図を更新
   */
  updateMap() {
    JapanMap.update(this.data.totalDistance, this.data.reachedCities);
  },
  
  /**
   * 履歴表示を更新
   */
  updateHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (this.data.records.length === 0) {
      historyList.innerHTML = '<p class="empty-message">まだ記録がありません</p>';
      return;
    }
    
    // 日付の新しい順にソート
    const sortedRecords = [...this.data.records].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    historyList.innerHTML = sortedRecords.slice(0, 20).map(record => `
      <div class="history-item" data-id="${record.id}">
        <div class="history-info">
          <span class="history-icon">${record.type === 'run' ? '🏃' : '🚶'}</span>
          <span class="history-date">${this.formatDate(record.date)}</span>
          <span class="history-distance">${record.distance.toFixed(1)} km</span>
        </div>
        <button class="history-delete" onclick="App.deleteRecord(${record.id})" title="削除">
          ✕
        </button>
      </div>
    `).join('');
  },
  
  /**
   * バッジ表示を更新
   */
  updateBadges() {
    const badgesList = document.getElementById('badges-list');
    if (!badgesList) return;
    
    const allBadges = Achievements.getAllBadges(this.data.earnedBadges);
    const earnedCount = allBadges.filter(b => b.earned).length;
    
    // 獲得数表示
    const badgeCountEl = document.getElementById('badge-count');
    if (badgeCountEl) {
      badgeCountEl.textContent = `${earnedCount} / ${allBadges.length}`;
    }
    
    badgesList.innerHTML = allBadges.map(badge => `
      <div class="badge-item ${badge.earned ? 'earned' : 'locked'}">
        <span class="badge-icon">${badge.earned ? badge.icon : '🔒'}</span>
        <span class="badge-name">${badge.name}</span>
        <span class="badge-desc">${badge.description}</span>
      </div>
    `).join('');
  },
  
  /**
   * レベル表示を更新
   */
  updateLevel() {
    const levelInfo = Achievements.getCurrentLevel(this.data.totalDistance);
    
    const levelNameEl = document.getElementById('level-name');
    const levelIconEl = document.getElementById('level-icon');
    const levelProgressEl = document.getElementById('level-progress');
    
    if (levelNameEl) {
      levelNameEl.textContent = levelInfo.current.name;
    }
    if (levelIconEl) {
      levelIconEl.textContent = levelInfo.current.icon;
    }
    if (levelProgressEl) {
      levelProgressEl.style.width = `${levelInfo.progress}%`;
    }
    
    // 次のレベルまでの距離
    const nextLevelEl = document.getElementById('next-level-distance');
    if (nextLevelEl && levelInfo.next) {
      nextLevelEl.textContent = `次のレベルまで ${levelInfo.distanceToNext.toFixed(0)} km`;
    } else if (nextLevelEl) {
      nextLevelEl.textContent = '最高レベル達成！';
    }
  },
  
  /**
   * 記録削除
   */
  deleteRecord(recordId) {
    if (!confirm('この記録を削除しますか？')) return;
    
    this.data = Storage.deleteRecord(recordId);
    this.updateUI();
    this.showToast('記録を削除しました', 'info');
  },
  
  /**
   * タブ切り替え
   */
  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });
  },
  
  /**
   * データエクスポート
   */
  exportData() {
    const json = Storage.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `japan-journey-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.showToast('データをエクスポートしました', 'success');
  },
  
  /**
   * データインポート
   */
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (Storage.importData(event.target.result)) {
          this.data = Storage.load();
          this.updateUI();
          this.showToast('データをインポートしました', 'success');
        } else {
          this.showToast('インポートに失敗しました', 'error');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  },
  
  /**
   * データリセット
   */
  resetData() {
    if (!confirm('本当にすべてのデータをリセットしますか？\nこの操作は取り消せません。')) return;
    if (!confirm('最後の確認です。本当にリセットしますか？')) return;
    
    this.data = Storage.reset();
    this.updateUI();
    this.showToast('データをリセットしました', 'info');
  },
  
  /**
   * 都市到達モーダル表示
   */
  showCityReachedModal(city) {
    const modal = document.getElementById('city-modal');
    if (!modal) return;
    
    document.getElementById('modal-city-name').textContent = city.name;
    document.getElementById('modal-city-prefecture').textContent = city.prefecture;
    document.getElementById('modal-city-trivia').textContent = city.trivia;
    document.getElementById('modal-city-landmark').textContent = `🏛️ ${city.landmark}`;
    
    modal.classList.add('show');
    
    // 紙吹雪エフェクト
    this.showConfetti();
  },
  
  /**
   * バッジ獲得トースト
   */
  showBadgeEarnedToast(badge) {
    this.showToast(`🎉 バッジ獲得！ ${badge.icon} ${badge.name}`, 'badge');
  },
  
  /**
   * ゴールモーダル表示
   */
  showGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) {
      modal.classList.add('show');
      this.showConfetti();
    }
  },
  
  /**
   * モーダルを閉じる
   */
  closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
    });
  },
  
  /**
   * 初回訪問メッセージ
   */
  showWelcomeMessage() {
    this.showToast('🗾 日本縦断チャレンジへようこそ！\n最初の記録を入力してみましょう', 'info', 5000);
  },
  
  /**
   * トースト通知
   */
  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message.replace('\n', '<br>');
    
    container.appendChild(toast);
    
    // アニメーション開始
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 自動削除
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  /**
   * 紙吹雪エフェクト
   */
  showConfetti() {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b9d'];
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = (Math.random() * 1 + 2) + 's';
      container.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3000);
    }
  },
  
  /**
   * 日付フォーマット
   */
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day} (${weekday})`;
  }
};

// アプリ起動
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
