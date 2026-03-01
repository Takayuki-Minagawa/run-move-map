/**
 * メインアプリケーションロジック v2.0
 * 拡張機能対応版
 */

const App = {
  data: null,
  modules: {},
  
  /**
   * アプリ初期化
   */
  async init() {
    console.log('🚀 App.init() 開始');
    
    try {
      // データ読み込み
      this.data = Storage.load();
      console.log('✅ Storage loaded');
      
      // テーマ初期化（最優先）
      if (typeof Theme !== 'undefined') {
        Theme.init();
        this.modules.theme = Theme;
        console.log('✅ Theme initialized');
      }
      
      // 多言語初期化
      if (typeof I18N !== 'undefined') {
        I18N.init();
        this.modules.i18n = I18N;
        console.log('✅ I18N initialized');
      }
      
      // 地図初期化
      if (typeof JapanMap !== 'undefined') {
        await JapanMap.init('map-container');
        console.log('✅ JapanMap initialized');
      }
      
      // ルート管理初期化（ROUTE_DATAはグローバル関数として定義）
      if (typeof ROUTE_DATA !== 'undefined') {
        this.modules.routes = { data: ROUTE_DATA };
        console.log('✅ Route data loaded');
      }
      
      // UI初期化
      this.initForm();
      this.initEventListeners();
      console.log('✅ Event listeners initialized');
      
      // 表示更新
      this.updateUI();
      console.log('✅ UI updated');
      
      // 追加モジュール初期化
      this.initExtendedModules();
      console.log('✅ Extended modules initialized');
      
      // Service Worker登録
      this.registerServiceWorker();

      // クラウドバックアップ初期化
      await this.initCloudBackup();

      // 初回訪問メッセージ
      if (this.data.records.length === 0 && !this._backupRestored) {
        this.showWelcomeMessage();
      }
      
      console.log('🗾 日本縦断チャレンジ v2.0 アプリ起動完了！');
    } catch (error) {
      console.error('❌ App.init() エラー:', error);
    }
  },
  
  /**
   * 拡張モジュール初期化
   */
  initExtendedModules() {
    // カレンダー初期化
    if (typeof Calendar !== 'undefined') {
      Calendar.init('calendar-container', this.data.records);
      this.modules.calendar = Calendar;
    }
    
    // グラフ初期化
    if (typeof Charts !== 'undefined') {
      Charts.init();
      // 初期グラフを描画
      const stats = Storage.getStatistics();
      Charts.updateAllCharts(this.data.records, stats);
      this.modules.charts = Charts;
    }
    
    // 目標初期化
    if (typeof Goals !== 'undefined') {
      Goals.init('goals-settings', 'challenge-selector', this.data.records);
      this.modules.goals = Goals;
    }
    
    // 拡張バッジ初期化
    if (typeof ExtendedAchievements !== 'undefined') {
      this.modules.extendedAchievements = ExtendedAchievements;
    }
    
    // ソーシャル機能UI初期化
    if (typeof Social !== 'undefined') {
      Social.init();
      this.modules.social = Social;
    }
  },
  
  /**
   * Service Worker登録
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        // 相対パスでService Workerを登録（GitHub Pages対応）
        const swPath = new URL('./sw.js', window.location.href).href;
        await navigator.serviceWorker.register(swPath);
        console.log('✅ Service Worker registered');
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
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
      btn.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn && tabBtn.dataset.tab) {
          this.switchTab(tabBtn.dataset.tab);
        }
      });
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
    
    // テーマ切り替えボタン
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && this.modules.theme) {
      themeToggle.addEventListener('click', () => {
        this.modules.theme.toggle();
        this.updateThemeButtonIcon();
      });
    }
    
    // テーマ選択ボタン
    document.querySelectorAll('.theme-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        if (this.modules.theme) {
          this.modules.theme.setTheme(theme);
          this.updateThemeButtons();
        }
      });
    });
    
    // 言語選択ボタン
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (this.modules.i18n) {
          this.modules.i18n.setLanguage(lang);
          this.updateLanguageButtons();
        }
      });
    });
    
    // 目標設定ボタン
    const editGoalsBtn = document.getElementById('edit-goals-btn');
    if (editGoalsBtn) {
      editGoalsBtn.addEventListener('click', () => this.openGoalsModal());
    }
    
    // 目標保存ボタン
    const saveGoalsBtn = document.getElementById('save-goals-btn');
    if (saveGoalsBtn) {
      saveGoalsBtn.addEventListener('click', () => this.saveGoals());
    }
    
    // 誕生日保存ボタン
    const saveBirthdayBtn = document.getElementById('save-birthday-btn');
    if (saveBirthdayBtn) {
      saveBirthdayBtn.addEventListener('click', () => this.saveBirthday());
    }
    
    // 写真アップロード
    const photoInput = document.getElementById('record-photo');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    }
    
    // 写真選択ボタン
    const photoBtn = document.getElementById('photo-btn');
    if (photoBtn && photoInput) {
      photoBtn.addEventListener('click', () => photoInput.click());
    }
    
    // 目標フォーム送信
    const goalsForm = document.getElementById('goals-form');
    if (goalsForm) {
      goalsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveGoals();
      });
    }

    // ── バックアップ関連 ──
    const backupSelectBtn = document.getElementById('backup-select-btn');
    if (backupSelectBtn) {
      backupSelectBtn.addEventListener('click', () => this.selectBackupFile());
    }
    const backupNowBtn = document.getElementById('backup-now-btn');
    if (backupNowBtn) {
      backupNowBtn.addEventListener('click', () => this.manualBackup());
    }
    const backupRestoreBtn = document.getElementById('backup-restore-btn');
    if (backupRestoreBtn) {
      backupRestoreBtn.addEventListener('click', () => this.restoreFromBackup());
    }
    const backupClearBtn = document.getElementById('backup-clear-btn');
    if (backupClearBtn) {
      backupClearBtn.addEventListener('click', () => this.clearBackupPath());
    }
    // バックアップ設定モーダルのボタン
    const backupSetupSelectBtn = document.getElementById('backup-setup-select-btn');
    if (backupSetupSelectBtn) {
      backupSetupSelectBtn.addEventListener('click', () => this.selectBackupFile(true));
    }
    const backupSetupSkipBtn = document.getElementById('backup-setup-skip-btn');
    if (backupSetupSkipBtn) {
      backupSetupSkipBtn.addEventListener('click', () => this.closeBackupSetupModal());
    }

    // 初期UI状態更新
    this.updateThemeButtons();
    this.updateLanguageButtons();
    this.initLanguageSelector();
  },
  
  /**
   * 言語セレクターを初期化
   */
  initLanguageSelector() {
    const container = document.getElementById('language-selector');
    if (container) {
      container.innerHTML = `
        <div class="language-selector">
          <button class="lang-btn" data-lang="ja">🇯🇵 日本語</button>
          <button class="lang-btn" data-lang="en">🇬🇧 English</button>
        </div>
      `;
      
      // 言語ボタンにイベント追加
      container.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const lang = btn.dataset.lang;
          if (this.modules.i18n) {
            this.modules.i18n.setLanguage(lang);
            this.updateLanguageButtons();
          }
        });
      });
      
      this.updateLanguageButtons();
    }
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
    const memo = form.querySelector('#record-memo')?.value || '';
    const photo = this.currentPhoto || null;
    
    if (!date || isNaN(distance) || distance <= 0) {
      this.showToast('日付と距離を正しく入力してください', 'error');
      return;
    }
    
    // 記録前の累計距離を保存
    const oldDistance = this.data.totalDistance;
    
    // 記録を追加（メモと写真も含む）
    this.data = Storage.addRecord({ date, distance, type, memo, photo });
    
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
    
    // 拡張バッジもチェック
    if (this.modules.extendedAchievements) {
      const newExtendedBadges = this.modules.extendedAchievements.checkNewBadges(this.data);
      newExtendedBadges.forEach(badge => {
        if (!this.data.earnedBadges.includes(badge.id)) {
          Storage.earnBadge(badge.id);
          this.data.earnedBadges.push(badge.id);
          this.showBadgeEarnedToast(badge);
        }
      });
    }
    
    // 完走チェック
    if (this.data.totalDistance >= 3000 && oldDistance < 3000) {
      this.showGoalModal();
      JapanMap.celebrateGoal();
    }
    
    // UI更新
    this.updateUI();

    // 拡張モジュール更新
    this.updateExtendedModules();

    // フォームリセット
    form.querySelector('#record-distance').value = '';
    const memoInput = form.querySelector('#record-memo');
    if (memoInput) memoInput.value = '';
    this.clearPhotoPreview();

    // 成功メッセージ
    this.showToast(`${distance}km を記録しました！ ${type === 'run' ? '🏃' : '🚶'}`, 'success');

    // 自動バックアップ
    this.autoBackup();
  },
  
  /**
   * 拡張モジュール更新
   */
  updateExtendedModules() {
    if (this.modules.calendar) {
      this.modules.calendar.init('calendar-container', this.data.records);
    }
    if (this.modules.charts) {
      const stats = Storage.getStatistics();
      this.modules.charts.updateAllCharts(this.data.records, stats);
    }
    if (this.modules.goals) {
      this.modules.goals.init('goals-settings', 'challenge-selector', this.data.records);
    }
  },

  /**
   * 写真アップロード処理
   */
  handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 500000) { // 500KB制限
      this.showToast('写真は500KB以下にしてください', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      this.currentPhoto = event.target.result;
      this.showPhotoPreview(this.currentPhoto);
    };
    reader.readAsDataURL(file);
  },
  
  /**
   * 写真プレビュー表示
   */
  showPhotoPreview(dataUrl) {
    const preview = document.getElementById('photo-preview');
    if (preview) {
      preview.innerHTML = `
        <div style="position: relative; display: inline-block;">
          <img src="${dataUrl}" alt="プレビュー">
          <button class="remove-photo" onclick="App.clearPhotoPreview()">✕</button>
        </div>
      `;
    }
  },
  
  /**
   * 写真プレビュークリア
   */
  clearPhotoPreview() {
    this.currentPhoto = null;
    const preview = document.getElementById('photo-preview');
    if (preview) preview.innerHTML = '';
    const input = document.getElementById('record-photo');
    if (input) input.value = '';
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
          <span class="history-distance">${record.distance.toFixed(2)} km</span>
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

    // 自動バックアップ
    this.autoBackup();
  },
  
  /**
   * タブ切り替え
   */
  switchTab(tabId) {
    if (!tabId) return;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabId);
    });
    
    // 統計タブの場合、グラフを再描画
    if (tabId === 'stats-tab' && this.modules.charts) {
      const stats = Storage.getStatistics();
      this.modules.charts.updateAllCharts(this.data.records, stats);
    }
    
    // カレンダータブの場合、カレンダーを再描画
    if (tabId === 'calendar-tab' && this.modules.calendar) {
      this.modules.calendar.init('calendar-container', this.data.records);
    }
    
    // 目標タブの場合、目標を再描画
    if (tabId === 'goals-tab' && this.modules.goals) {
      this.modules.goals.init('goals-settings', 'challenge-selector', this.data.records);
    }
    
    // ルートタブの場合、ルートを再描画
    if (tabId === 'routes-tab' && typeof RouteManager !== 'undefined') {
      RouteManager.renderRouteSelector('route-selector', RouteManager.currentRouteId, this.data.totalDistance);
    }
    
    // ソーシャルタブの場合
    if (tabId === 'social-tab' && this.modules.social) {
      this.modules.social.init();
    }
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
          // 自動バックアップ
          this.autoBackup();
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
  },
  
  /**
   * テーマボタンアイコン更新
   */
  updateThemeButtonIcon() {
    const btn = document.getElementById('theme-toggle');
    if (btn && this.modules.theme) {
      btn.textContent = this.modules.theme.current === 'dark' ? '☀️' : '🌙';
    }
  },
  
  /**
   * テーマボタン状態更新
   */
  updateThemeButtons() {
    const current = this.modules.theme?.current || 'light';
    document.querySelectorAll('.theme-select-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === current);
    });
    this.updateThemeButtonIcon();
  },
  
  /**
   * 言語ボタン状態更新
   */
  updateLanguageButtons() {
    const current = this.modules.i18n?.currentLanguage || 'ja';
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === current);
    });
  },
  
  /**
   * 目標設定モーダルを開く
   */
  openGoalsModal() {
    const modal = document.getElementById('goals-modal');
    if (modal) {
      // 現在の目標値をフォームに反映
      const goals = Storage.load().goals || {};
      const monthlyInput = document.getElementById('goal-monthly-distance');
      const weeklyInput = document.getElementById('goal-weekly-distance');
      const streakInput = document.getElementById('goal-streak');
      
      if (monthlyInput && goals.monthly) {
        monthlyInput.value = goals.monthly.target;
        document.getElementById('goal-monthly-enabled').checked = goals.monthly.enabled;
      }
      if (weeklyInput && goals.weekly) {
        weeklyInput.value = goals.weekly.target;
        document.getElementById('goal-weekly-enabled').checked = goals.weekly.enabled;
      }
      if (streakInput && goals.streak) {
        streakInput.value = goals.streak.target;
        document.getElementById('goal-streak-enabled').checked = goals.streak.enabled;
      }
      
      modal.classList.add('show');
    }
  },
  
  /**
   * 目標保存
   */
  saveGoals() {
    const goals = {
      monthly: {
        enabled: document.getElementById('goal-monthly-enabled')?.checked || false,
        target: parseFloat(document.getElementById('goal-monthly-distance')?.value) || 100
      },
      weekly: {
        enabled: document.getElementById('goal-weekly-enabled')?.checked || false,
        target: parseFloat(document.getElementById('goal-weekly-distance')?.value) || 30
      },
      streak: {
        enabled: document.getElementById('goal-streak-enabled')?.checked || false,
        target: parseInt(document.getElementById('goal-streak')?.value) || 7
      }
    };
    
    Storage.saveGoals(goals);
    this.closeModal();
    
    if (this.modules.goals) {
      this.modules.goals.init(this.data);
    }
    
    this.showToast('目標を保存しました！', 'success');
  },
  
  /**
   * 誕生日保存
   */
  saveBirthday() {
    const input = document.getElementById('birthday-input');
    if (input && input.value) {
      Storage.saveBirthday(input.value);
      this.showToast('誕生日を保存しました！', 'success');
    }
  },

  // ══════════════════════════════════════════════════════
  // クラウドバックアップ関連
  // ══════════════════════════════════════════════════════

  /**
   * CloudBackup モジュールを初期化しバックアップ確認を行う
   */
  async initCloudBackup() {
    if (typeof CloudBackup === 'undefined') return;

    const status = await CloudBackup.init();
    this.modules.cloudBackup = CloudBackup;
    this.updateBackupStatus();

    if (!status.isSupported) {
      // File System Access API 非対応ブラウザ（Firefox / Safari 等）
      const card = document.getElementById('backup-settings-card');
      if (card) {
        card.querySelector('.settings-section').innerHTML =
          '<p style="color:var(--text-secondary);font-size:0.9em;">⚠️ このブラウザはバックアップパス機能に対応していません。<br>Chrome / Edge をご利用ください。<br>手動エクスポート/インポートでデータを保護できます。</p>';
      }
      return;
    }

    if (!status.hasHandle) {
      // 未設定 → セットアップモーダルを表示
      this.showBackupSetupModal();
    } else {
      // 既存ハンドルあり → キャッシュとの整合チェック
      await this.checkBackupRestore();
    }
  },

  /**
   * バックアップ設定モーダルを表示
   */
  showBackupSetupModal() {
    const modal = document.getElementById('backup-setup-modal');
    if (modal) modal.classList.add('show');
  },

  /**
   * バックアップ設定モーダルを閉じる
   */
  closeBackupSetupModal() {
    const modal = document.getElementById('backup-setup-modal');
    if (modal) modal.classList.remove('show');
  },

  /**
   * バックアップファイルを選択する
   * @param {boolean} fromSetupModal - 設定モーダルから呼ばれた場合は閉じる
   */
  async selectBackupFile(fromSetupModal = false) {
    if (!this.modules.cloudBackup) return;

    const selected = await this.modules.cloudBackup.selectBackupFile();
    if (selected) {
      this.updateBackupStatus();
      // 現在のデータをすぐにバックアップ
      await this.modules.cloudBackup.saveBackup(Storage.load());
      this.showToast('バックアップ保存先を設定しました ✅', 'success');
      if (fromSetupModal) this.closeBackupSetupModal();
    } else if (!fromSetupModal) {
      this.showToast('保存先の選択がキャンセルされました', 'info');
    }
  },

  /**
   * バックアップからデータを復元するか確認し実行
   */
  async checkBackupRestore() {
    const backup = await this.modules.cloudBackup.loadBackup();
    if (!backup || !Array.isArray(backup.records)) return;

    const localData = Storage.load();
    const backupDate = new Date(backup.updatedAt || 0);
    const localDate  = new Date(localData.updatedAt || 0);

    const localEmpty = localData.records.length === 0;
    const backupNewer = backupDate > localDate && backup.records.length > 0;

    if (localEmpty && backup.records.length > 0) {
      // キャッシュが空で、バックアップにデータあり → 自動復元を提案
      if (confirm(
        `⚠️ キャッシュにデータがありません。\n` +
        `バックアップファイルに ${backup.records.length} 件の記録があります。\n\n` +
        `バックアップから復元しますか？`
      )) {
        Storage.importData(JSON.stringify(backup));
        this.data = Storage.load();
        this.updateUI();
        this._backupRestored = true;
        this.showToast('バックアップから復元しました！', 'success');
      }
    } else if (backupNewer) {
      // バックアップの方が新しい → 復元を提案
      if (confirm(
        `ℹ️ バックアップが現在のキャッシュより新しいデータを持っています。\n` +
        `（バックアップ: ${backupDate.toLocaleString()}）\n\n` +
        `バックアップから復元しますか？`
      )) {
        Storage.importData(JSON.stringify(backup));
        this.data = Storage.load();
        this.updateUI();
        this._backupRestored = true;
        this.showToast('バックアップから復元しました！', 'success');
      }
    }
  },

  /**
   * 手動バックアップ
   */
  async manualBackup() {
    if (!this.modules.cloudBackup?.fileHandle) return;
    const ok = await this.modules.cloudBackup.saveBackup(Storage.load());
    if (ok) {
      this.showToast('バックアップを保存しました ✅', 'success');
    } else {
      this.showToast('バックアップ保存に失敗しました', 'error');
    }
  },

  /**
   * バックアップから手動復元
   */
  async restoreFromBackup() {
    if (!this.modules.cloudBackup?.fileHandle) return;
    if (!confirm('バックアップファイルの内容で現在のデータを上書きしますか？')) return;

    const backup = await this.modules.cloudBackup.loadBackup();
    if (!backup) {
      this.showToast('バックアップの読み込みに失敗しました', 'error');
      return;
    }
    Storage.importData(JSON.stringify(backup));
    this.data = Storage.load();
    this.updateUI();
    this.showToast('バックアップから復元しました！', 'success');
  },

  /**
   * バックアップ設定をクリア
   */
  async clearBackupPath() {
    if (!confirm('バックアップ保存先の設定を削除しますか？\nデータは削除されません。')) return;
    await this.modules.cloudBackup?.clearBackupPath();
    this.updateBackupStatus();
    this.showToast('バックアップ設定をクリアしました', 'info');
  },

  /**
   * 自動バックアップ（サイレント）
   */
  async autoBackup() {
    if (!this.modules.cloudBackup?.fileHandle) return;
    await this.modules.cloudBackup.saveBackup(Storage.load());
    // 最終バックアップ時刻を更新
    this.updateBackupLastTime();
  },

  /**
   * 設定タブのバックアップ状態表示を更新
   */
  updateBackupStatus() {
    const backup = this.modules.cloudBackup;
    if (!backup) return;

    const icon    = document.getElementById('backup-status-icon');
    const text    = document.getElementById('backup-status-text');
    const hint    = document.getElementById('backup-path-hint');
    const nameEl  = document.getElementById('backup-file-name');
    const nowBtn  = document.getElementById('backup-now-btn');
    const restBtn = document.getElementById('backup-restore-btn');
    const clearBtn = document.getElementById('backup-clear-btn');

    if (backup.fileHandle) {
      if (icon)    icon.textContent  = '🟢';
      if (text)    text.textContent  = '設定済み';
      if (nameEl)  nameEl.textContent = `📄 ${backup.getFileName()}`;
      if (hint)    hint.style.display = '';
      if (nowBtn)  nowBtn.disabled  = false;
      if (restBtn) restBtn.disabled = false;
      if (clearBtn) clearBtn.style.display = '';
    } else {
      if (icon)    icon.textContent  = '⚪';
      if (text)    text.textContent  = '未設定';
      if (hint)    hint.style.display = 'none';
      if (nowBtn)  nowBtn.disabled  = true;
      if (restBtn) restBtn.disabled = true;
      if (clearBtn) clearBtn.style.display = 'none';
    }
  },

  /**
   * 最終バックアップ時刻表示を更新
   */
  updateBackupLastTime() {
    const nameEl = document.getElementById('backup-file-name');
    if (nameEl && this.modules.cloudBackup?.fileHandle) {
      const now = new Date().toLocaleTimeString('ja-JP');
      nameEl.textContent =
        `📄 ${this.modules.cloudBackup.getFileName()}  （最終: ${now}）`;
    }
  }
};

// アプリ起動
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
