/**
 * ソーシャル機能（UIプレビュー版）
 * クラウド同期、フレンド、ランキング、外部連携のUI
 * ※実際の機能にはバックエンドが必要
 */

const Social = {
  /**
   * ソーシャル機能初期化
   * @param {string} containerId
   */
  init(containerId = 'social-container') {
    this.renderAll(containerId);
  },

  /**
   * クラウド同期UI
   */
  renderCloudSync(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="social-feature cloud-sync">
        <div class="feature-icon">☁️</div>
        <div class="feature-content">
          <h4>クラウド同期</h4>
          <p>Googleアカウントでログインして、端末間でデータを同期しましょう。</p>
          <button class="social-btn google-btn" disabled>
            <img src="https://www.google.com/favicon.ico" alt="Google" width="20" height="20">
            Googleでログイン
          </button>
          <span class="coming-soon-badge">🔜 近日公開</span>
        </div>
      </div>
    `;
  },
  
  /**
   * フレンド機能UI
   */
  renderFriends(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="social-feature friends">
        <div class="feature-icon">👫</div>
        <div class="feature-content">
          <h4>フレンド</h4>
          <p>友達を追加して、お互いの進捗を見ながら一緒に頑張りましょう！</p>
          
          <div class="friend-preview">
            <div class="friend-item preview">
              <span class="friend-avatar">👤</span>
              <div class="friend-info">
                <span class="friend-name">友達を追加すると...</span>
                <span class="friend-progress">ここに進捗が表示されます</span>
              </div>
            </div>
          </div>
          
          <button class="social-btn" disabled>
            ➕ 友達を追加
          </button>
          <span class="coming-soon-badge">🔜 近日公開</span>
        </div>
      </div>
    `;
  },
  
  /**
   * ランキングUI
   */
  renderRanking(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // サンプルランキングデータ
    const sampleRanking = [
      { rank: 1, name: 'ランナーA', distance: 156.2, badge: '🥇' },
      { rank: 2, name: 'ウォーカーB', distance: 134.5, badge: '🥈' },
      { rank: 3, name: 'あなた', distance: 98.3, badge: '🥉', isMe: true },
      { rank: 4, name: 'ジョガーC', distance: 87.1, badge: '' },
      { rank: 5, name: 'トラベラーD', distance: 76.8, badge: '' }
    ];
    
    container.innerHTML = `
      <div class="social-feature ranking">
        <div class="feature-icon">🏆</div>
        <div class="feature-content">
          <h4>週間ランキング</h4>
          <p>週間・月間のランキングで友達と競争しよう！</p>
          
          <div class="ranking-preview">
            <div class="ranking-tabs">
              <button class="ranking-tab active">週間</button>
              <button class="ranking-tab">月間</button>
              <button class="ranking-tab">累計</button>
            </div>
            <div class="ranking-list">
              ${sampleRanking.map(r => `
                <div class="ranking-item ${r.isMe ? 'is-me' : ''} preview">
                  <span class="rank">${r.badge || r.rank}</span>
                  <span class="name">${r.name}</span>
                  <span class="distance">${r.distance} km</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <span class="coming-soon-badge">🔜 近日公開</span>
        </div>
      </div>
    `;
  },
  
  /**
   * 外部アプリ連携UI
   */
  renderExternalApps(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const apps = [
      {
        id: 'strava',
        name: 'Strava',
        icon: '🏃',
        color: '#fc4c02',
        description: 'StravaのアクティビティをMでインポート'
      },
      {
        id: 'garmin',
        name: 'Garmin Connect',
        icon: '⌚',
        color: '#007dcd',
        description: 'Garminデバイスのデータを連携'
      },
      {
        id: 'nike',
        name: 'Nike Run Club',
        icon: '👟',
        color: '#111',
        description: 'Nike Run Clubのランを同期'
      },
      {
        id: 'apple',
        name: 'Apple Health',
        icon: '❤️',
        color: '#ff2d55',
        description: 'Apple Healthのワークアウトを取り込み'
      }
    ];
    
    container.innerHTML = `
      <div class="social-feature external-apps">
        <div class="feature-icon">🔗</div>
        <div class="feature-content">
          <h4>外部アプリ連携</h4>
          <p>お使いのフィットネスアプリと連携して、自動で記録をインポートできます。</p>
          
          <div class="apps-grid">
            ${apps.map(app => `
              <div class="app-item">
                <span class="app-icon" style="background: ${app.color}">${app.icon}</span>
                <div class="app-info">
                  <span class="app-name">${app.name}</span>
                  <span class="app-desc">${app.description}</span>
                </div>
                <button class="connect-btn" disabled>連携</button>
              </div>
            `).join('')}
          </div>
          
          <span class="coming-soon-badge">🔜 近日公開</span>
        </div>
      </div>
    `;
  },
  
  /**
   * 全ソーシャル機能をまとめて描画
   */
  renderAll(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="social-container">
        <div class="social-header">
          <h3>👥 ソーシャル機能</h3>
          <p>これらの機能は今後のアップデートで追加予定です</p>
        </div>
        <div id="cloud-sync-section"></div>
        <div id="friends-section"></div>
        <div id="ranking-section"></div>
        <div id="external-apps-section"></div>
      </div>
    `;
    
    this.renderCloudSync('cloud-sync-section');
    this.renderFriends('friends-section');
    this.renderRanking('ranking-section');
    this.renderExternalApps('external-apps-section');
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Social;
}
