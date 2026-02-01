/**
 * ダークモード・テーマ機能
 */

const Theme = {
  STORAGE_KEY: 'japanJourneyTheme',
  
  /**
   * テーマを初期化
   */
  init() {
    // 保存されたテーマを読み込み
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // システム設定を検出
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // システム設定の変更を監視
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  },
  
  /**
   * テーマを設定
   */
  setTheme(theme) {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${theme}-mode`);
    
    // メタタグの色も更新
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#f8fafc');
    }
    
    localStorage.setItem(this.STORAGE_KEY, theme);
    
    // チャートの色を更新
    if (typeof Charts !== 'undefined') {
      Charts.updateAllCharts && Charts.updateAllCharts(
        App?.data?.records || [],
        App?.data?.stats || {}
      );
    }
  },
  
  /**
   * テーマを切り替え
   */
  toggle() {
    const isDark = document.body.classList.contains('dark-mode');
    this.setTheme(isDark ? 'light' : 'dark');
    return !isDark;
  },
  
  /**
   * 現在のテーマを取得
   */
  getCurrentTheme() {
    return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  },
  
  /**
   * テーマ切り替えボタンを描画
   */
  renderToggleButton(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const isDark = this.getCurrentTheme() === 'dark';
    container.innerHTML = `
      <button class="theme-toggle-btn" id="theme-toggle" title="テーマ切り替え">
        ${isDark ? '☀️' : '🌙'}
      </button>
    `;
    
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const nowDark = this.toggle();
      container.querySelector('.theme-toggle-btn').textContent = nowDark ? '☀️' : '🌙';
    });
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Theme;
}
