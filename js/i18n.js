/**
 * 多言語対応（i18n）
 * 日本語・英語のサポート
 */

const I18N = {
  STORAGE_KEY: 'japanJourneyLanguage',
  currentLang: 'ja',
  
  translations: {
    ja: {
      // ヘッダー
      'app.title': '🗾 日本縦断チャレンジ',
      'app.subtitle': '走って歩いて、沖縄から北海道へ！',
      
      // 進捗
      'progress.current': '📍 現在地',
      'progress.next': '🎯 次の目的地',
      'progress.remaining': '残り',
      'progress.total': '全体進捗',
      'progress.goal': '🎉 ゴール！',
      
      // 統計
      'stats.totalDistance': '累計距離 (km)',
      'stats.streakDays': '連続日数',
      'stats.weeklyDistance': '今週 (km)',
      'stats.totalRecords': '記録回数',
      'stats.monthlyDistance': '今月 (km)',
      
      // レベル
      'level.nextLevel': '次のレベルまで',
      'level.maxLevel': '最高レベル達成！',
      
      // フォーム
      'form.title': '📝 距離を記録',
      'form.date': '日付',
      'form.distance': '距離 (km)',
      'form.type': '種別',
      'form.run': '🏃 ランニング',
      'form.walk': '🚶 ウォーキング',
      'form.memo': '一言メモ（任意）',
      'form.photo': '📷 写真を追加',
      'form.submit': '記録する',
      
      // タブ
      'tab.history': '📜 履歴',
      'tab.badges': '🏅 バッジ',
      'tab.stats': '📊 統計',
      'tab.calendar': '📅 カレンダー',
      'tab.goals': '🎯 目標',
      'tab.challenges': '🏆 チャレンジ',
      'tab.routes': '🗺️ コース',
      'tab.settings': '⚙️ 設定',
      'tab.social': '👥 ソーシャル',
      
      // 履歴
      'history.empty': 'まだ記録がありません',
      'history.delete': '削除',
      
      // バッジ
      'badges.title': '🏅 獲得バッジ',
      'badges.locked': 'ロック中',
      'badges.secret': 'シークレット',
      
      // 統計グラフ
      'charts.weekly': '📊 週間距離',
      'charts.monthly': '📈 月間推移',
      'charts.type': '🏃🚶 種別割合',
      'charts.cumulative': '📉 累計推移',
      'charts.dayofweek': '📅 曜日別',
      
      // カレンダー
      'calendar.title': '📅 カレンダー',
      'calendar.noRecord': '記録なし',
      'calendar.monthTotal': 'km / 月',
      'calendar.daysActive': '日 / 月',
      'calendar.avgPerDay': 'km / 日平均',
      
      // 目標
      'goals.title': '🎯 目標設定',
      'goals.monthly': '📅 月間目標',
      'goals.weekly': '📆 週間目標',
      'goals.streak': '🔥 連続日数',
      'goals.frequency': '🎯 週間回数',
      'goals.remaining': '残り',
      'goals.completed': '✓ 達成！',
      'goals.edit': '⚙️ 目標を編集',
      
      // チャレンジ
      'challenge.title': '🏆 ミニチャレンジ',
      'challenge.select': 'チャレンジを選択',
      'challenge.start': '開始',
      'challenge.abandon': '中断する',
      'challenge.completed': '🎉 チャレンジ達成！',
      'challenge.daysRemaining': '残り日数',
      'challenge.difficulty.easy': '簡単',
      'challenge.difficulty.normal': '普通',
      'challenge.difficulty.hard': '難しい',
      'challenge.difficulty.extreme': '超難関',
      
      // ルート
      'route.title': '🗺️ コース選択',
      'route.select': 'このコースを選択',
      'route.current': '現在のコース',
      'route.distance': '総距離',
      'route.estimatedDays': '目安日数',
      
      // 設定
      'settings.title': '⚙️ 設定',
      'settings.dataManagement': 'データ管理',
      'settings.export': '📤 データをエクスポート',
      'settings.import': '📥 データをインポート',
      'settings.reset': '🗑️ データをリセット',
      'settings.theme': '🎨 テーマ',
      'settings.darkMode': '🌙 ダークモード',
      'settings.lightMode': '☀️ ライトモード',
      'settings.language': '🌐 言語',
      'settings.birthday': '🎂 誕生日（バッジ用）',
      
      // ソーシャル（準備）
      'social.title': '👥 ソーシャル',
      'social.cloud': '☁️ クラウド同期',
      'social.cloudDesc': 'Googleアカウントでログインして端末間でデータを同期',
      'social.friends': '👫 フレンド',
      'social.friendsDesc': '友達の進捗を見たり、一緒に頑張ろう',
      'social.ranking': '🏆 ランキング',
      'social.rankingDesc': '週間・月間ランキングで競争',
      'social.strava': '🔗 Strava連携',
      'social.stravaDesc': 'Stravaのアクティビティを自動インポート',
      'social.comingSoon': '近日公開',
      
      // モーダル
      'modal.cityReached': '到達しました！',
      'modal.awesome': 'すごい！',
      'modal.goalReached': '日本縦断達成！',
      'modal.congratulations': 'おめでとうございます！',
      'modal.goalMessage': 'あなたは日本縦断マスターです！',
      'modal.thanks': 'ありがとう！',
      
      // トースト
      'toast.recorded': 'を記録しました！',
      'toast.deleted': '記録を削除しました',
      'toast.exported': 'データをエクスポートしました',
      'toast.imported': 'データをインポートしました',
      'toast.importFailed': 'インポートに失敗しました',
      'toast.reset': 'データをリセットしました',
      'toast.badgeEarned': '🎉 バッジ獲得！',
      'toast.inputError': '日付と距離を正しく入力してください',
      'toast.welcome': '🗾 日本縦断チャレンジへようこそ！\n最初の記録を入力してみましょう',
      
      // フッター
      'footer.tagline': '🗾 日本縦断チャレンジ - 毎日の一歩が旅になる'
    },
    
    en: {
      // Header
      'app.title': '🗾 Japan Traverse Challenge',
      'app.subtitle': 'Run & Walk from Okinawa to Hokkaido!',
      
      // Progress
      'progress.current': '📍 Current Location',
      'progress.next': '🎯 Next Destination',
      'progress.remaining': 'remaining',
      'progress.total': 'Total Progress',
      'progress.goal': '🎉 Goal!',
      
      // Stats
      'stats.totalDistance': 'Total Distance (km)',
      'stats.streakDays': 'Streak Days',
      'stats.weeklyDistance': 'This Week (km)',
      'stats.totalRecords': 'Records',
      'stats.monthlyDistance': 'This Month (km)',
      
      // Level
      'level.nextLevel': 'to next level',
      'level.maxLevel': 'Max Level Achieved!',
      
      // Form
      'form.title': '📝 Record Distance',
      'form.date': 'Date',
      'form.distance': 'Distance (km)',
      'form.type': 'Type',
      'form.run': '🏃 Running',
      'form.walk': '🚶 Walking',
      'form.memo': 'Note (optional)',
      'form.photo': '📷 Add Photo',
      'form.submit': 'Record',
      
      // Tabs
      'tab.history': '📜 History',
      'tab.badges': '🏅 Badges',
      'tab.stats': '📊 Stats',
      'tab.calendar': '📅 Calendar',
      'tab.goals': '🎯 Goals',
      'tab.challenges': '🏆 Challenges',
      'tab.routes': '🗺️ Routes',
      'tab.settings': '⚙️ Settings',
      'tab.social': '👥 Social',
      
      // History
      'history.empty': 'No records yet',
      'history.delete': 'Delete',
      
      // Badges
      'badges.title': '🏅 Badges',
      'badges.locked': 'Locked',
      'badges.secret': 'Secret',
      
      // Charts
      'charts.weekly': '📊 Weekly Distance',
      'charts.monthly': '📈 Monthly Trend',
      'charts.type': '🏃🚶 Activity Type',
      'charts.cumulative': '📉 Cumulative',
      'charts.dayofweek': '📅 By Day of Week',
      
      // Calendar
      'calendar.title': '📅 Calendar',
      'calendar.noRecord': 'No record',
      'calendar.monthTotal': 'km / month',
      'calendar.daysActive': 'days / month',
      'calendar.avgPerDay': 'km / day avg',
      
      // Goals
      'goals.title': '🎯 Goals',
      'goals.monthly': '📅 Monthly Goal',
      'goals.weekly': '📆 Weekly Goal',
      'goals.streak': '🔥 Streak Goal',
      'goals.frequency': '🎯 Weekly Frequency',
      'goals.remaining': 'remaining',
      'goals.completed': '✓ Completed!',
      'goals.edit': '⚙️ Edit Goals',
      
      // Challenges
      'challenge.title': '🏆 Mini Challenges',
      'challenge.select': 'Select a Challenge',
      'challenge.start': 'Start',
      'challenge.abandon': 'Abandon',
      'challenge.completed': '🎉 Challenge Completed!',
      'challenge.daysRemaining': 'days remaining',
      'challenge.difficulty.easy': 'Easy',
      'challenge.difficulty.normal': 'Normal',
      'challenge.difficulty.hard': 'Hard',
      'challenge.difficulty.extreme': 'Extreme',
      
      // Routes
      'route.title': '🗺️ Select Route',
      'route.select': 'Select This Route',
      'route.current': 'Current Route',
      'route.distance': 'Total Distance',
      'route.estimatedDays': 'Est. Days',
      
      // Settings
      'settings.title': '⚙️ Settings',
      'settings.dataManagement': 'Data Management',
      'settings.export': '📤 Export Data',
      'settings.import': '📥 Import Data',
      'settings.reset': '🗑️ Reset Data',
      'settings.theme': '🎨 Theme',
      'settings.darkMode': '🌙 Dark Mode',
      'settings.lightMode': '☀️ Light Mode',
      'settings.language': '🌐 Language',
      'settings.birthday': '🎂 Birthday (for badges)',
      
      // Social
      'social.title': '👥 Social',
      'social.cloud': '☁️ Cloud Sync',
      'social.cloudDesc': 'Sign in with Google to sync data across devices',
      'social.friends': '👫 Friends',
      'social.friendsDesc': 'See friends progress and motivate each other',
      'social.ranking': '🏆 Ranking',
      'social.rankingDesc': 'Compete in weekly and monthly rankings',
      'social.strava': '🔗 Strava Connect',
      'social.stravaDesc': 'Auto-import activities from Strava',
      'social.comingSoon': 'Coming Soon',
      
      // Modals
      'modal.cityReached': 'Reached!',
      'modal.awesome': 'Awesome!',
      'modal.goalReached': 'Japan Traverse Complete!',
      'modal.congratulations': 'Congratulations!',
      'modal.goalMessage': 'You are a Japan Traverse Master!',
      'modal.thanks': 'Thanks!',
      
      // Toasts
      'toast.recorded': 'recorded!',
      'toast.deleted': 'Record deleted',
      'toast.exported': 'Data exported',
      'toast.imported': 'Data imported',
      'toast.importFailed': 'Import failed',
      'toast.reset': 'Data reset',
      'toast.badgeEarned': '🎉 Badge Earned!',
      'toast.inputError': 'Please enter valid date and distance',
      'toast.welcome': '🗾 Welcome to Japan Traverse Challenge!\nStart by recording your first activity',
      
      // Footer
      'footer.tagline': '🗾 Japan Traverse Challenge - Every step is a journey'
    }
  },
  
  /**
   * 言語を初期化
   */
  init() {
    const savedLang = localStorage.getItem(this.STORAGE_KEY);
    if (savedLang && this.translations[savedLang]) {
      this.currentLang = savedLang;
    } else {
      // ブラウザの言語設定を検出
      const browserLang = navigator.language.split('-')[0];
      this.currentLang = this.translations[browserLang] ? browserLang : 'ja';
    }
    this.applyTranslations();
  },
  
  /**
   * 言語を設定
   */
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem(this.STORAGE_KEY, lang);
      this.applyTranslations();
      return true;
    }
    return false;
  },
  
  /**
   * 翻訳を取得
   */
  t(key) {
    return this.translations[this.currentLang]?.[key] || 
           this.translations['ja']?.[key] || 
           key;
  },
  
  /**
   * 翻訳を適用
   */
  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (el.tagName === 'INPUT' && el.type === 'submit') {
        el.value = translation;
      } else if (el.hasAttribute('placeholder')) {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    });
    
    // HTMLのlang属性を更新
    document.documentElement.lang = this.currentLang;
  },
  
  /**
   * 言語切り替えUIを描画
   */
  renderLanguageSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="language-selector">
        <button class="lang-btn ${this.currentLang === 'ja' ? 'active' : ''}" data-lang="ja">🇯🇵 日本語</button>
        <button class="lang-btn ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en">🇺🇸 English</button>
      </div>
    `;
    
    container.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setLanguage(btn.dataset.lang);
        this.renderLanguageSelector(containerId);
        // UIを再描画
        if (typeof App !== 'undefined' && App.updateUI) {
          App.updateUI();
        }
      });
    });
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18N;
}
