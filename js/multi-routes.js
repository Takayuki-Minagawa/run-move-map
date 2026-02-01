/**
 * 複数ルート選択機能
 * 日本縦断以外のルートも選べるように
 */

const ROUTES = {
  // 日本縦断（デフォルト）
  japan_traverse: {
    id: 'japan_traverse',
    name: '🗾 日本縦断コース',
    description: '沖縄から北海道へ！3,000kmの大冒険',
    totalDistance: 3000,
    difficulty: 'hard',
    estimatedDays: 365,
    startIcon: '🌺',
    goalIcon: '⛄',
    cities: [
      { id: "okinawa", name: "那覇", prefecture: "沖縄県", cumulative: 0, coordinates: { x: 25, y: 92 }, trivia: "🌺 沖縄そばと美ら海水族館が有名！", landmark: "首里城" },
      { id: "kagoshima", name: "鹿児島", prefecture: "鹿児島県", cumulative: 650, coordinates: { x: 35, y: 78 }, trivia: "🌋 桜島が見える絶景の街。", landmark: "桜島" },
      { id: "kumamoto", name: "熊本", prefecture: "熊本県", cumulative: 800, coordinates: { x: 37, y: 72 }, trivia: "🐻 くまモンの故郷！", landmark: "熊本城" },
      { id: "fukuoka", name: "福岡", prefecture: "福岡県", cumulative: 920, coordinates: { x: 38, y: 68 }, trivia: "🍜 とんこつラーメン発祥の地。", landmark: "太宰府天満宮" },
      { id: "hiroshima", name: "広島", prefecture: "広島県", cumulative: 1100, coordinates: { x: 48, y: 65 }, trivia: "⛩️ 厳島神社と広島風お好み焼き。", landmark: "厳島神社" },
      { id: "okayama", name: "岡山", prefecture: "岡山県", cumulative: 1200, coordinates: { x: 54, y: 63 }, trivia: "🍑 桃太郎伝説の地。", landmark: "倉敷美観地区" },
      { id: "osaka", name: "大阪", prefecture: "大阪府", cumulative: 1350, coordinates: { x: 60, y: 60 }, trivia: "🐙 食い倒れの街！", landmark: "大阪城" },
      { id: "kyoto", name: "京都", prefecture: "京都府", cumulative: 1400, coordinates: { x: 62, y: 57 }, trivia: "⛩️ 千年の都。", landmark: "金閣寺" },
      { id: "nagoya", name: "名古屋", prefecture: "愛知県", cumulative: 1550, coordinates: { x: 66, y: 55 }, trivia: "🍤 独自の食文化が魅力。", landmark: "名古屋城" },
      { id: "shizuoka", name: "静岡", prefecture: "静岡県", cumulative: 1700, coordinates: { x: 72, y: 52 }, trivia: "🗻 富士山のお膝元！", landmark: "富士山" },
      { id: "tokyo", name: "東京", prefecture: "東京都", cumulative: 1880, coordinates: { x: 78, y: 48 }, trivia: "🗼 日本の首都！", landmark: "東京タワー" },
      { id: "sendai", name: "仙台", prefecture: "宮城県", cumulative: 2230, coordinates: { x: 82, y: 35 }, trivia: "🌿 杜の都。", landmark: "瑞鳳殿" },
      { id: "aomori", name: "青森", prefecture: "青森県", cumulative: 2530, coordinates: { x: 82, y: 25 }, trivia: "🍎 りんごの生産量日本一！", landmark: "弘前城" },
      { id: "sapporo", name: "札幌", prefecture: "北海道", cumulative: 3000, coordinates: { x: 85, y: 12 }, trivia: "🍺 ビールと味噌ラーメン！", landmark: "時計台" }
    ]
  },
  
  // 四国一周
  shikoku_loop: {
    id: 'shikoku_loop',
    name: '🍊 四国一周コース',
    description: 'お遍路気分で四国を一周！約1,000km',
    totalDistance: 1000,
    difficulty: 'normal',
    estimatedDays: 120,
    startIcon: '⛩️',
    goalIcon: '🎊',
    cities: [
      { id: "tokushima", name: "徳島", prefecture: "徳島県", cumulative: 0, coordinates: { x: 60, y: 65 }, trivia: "💃 阿波踊りの本場！", landmark: "眉山" },
      { id: "kochi", name: "高知", prefecture: "高知県", cumulative: 250, coordinates: { x: 55, y: 70 }, trivia: "🐟 カツオのたたきが絶品！", landmark: "高知城" },
      { id: "matsuyama", name: "松山", prefecture: "愛媛県", cumulative: 500, coordinates: { x: 50, y: 68 }, trivia: "♨️ 道後温泉で癒される。", landmark: "道後温泉" },
      { id: "takamatsu", name: "高松", prefecture: "香川県", cumulative: 750, coordinates: { x: 55, y: 63 }, trivia: "🍜 讃岐うどんの聖地！", landmark: "栗林公園" },
      { id: "tokushima_goal", name: "徳島（ゴール）", prefecture: "徳島県", cumulative: 1000, coordinates: { x: 60, y: 65 }, trivia: "🎉 四国一周達成おめでとう！", landmark: "鳴門の渦潮" }
    ]
  },
  
  // 東海道五十三次
  tokaido: {
    id: 'tokaido',
    name: '🏯 東海道五十三次',
    description: '江戸から京都へ！歴史の道を歩く約500km',
    totalDistance: 500,
    difficulty: 'easy',
    estimatedDays: 60,
    startIcon: '🗼',
    goalIcon: '⛩️',
    cities: [
      { id: "edo", name: "日本橋", prefecture: "東京都", cumulative: 0, coordinates: { x: 78, y: 48 }, trivia: "🏛️ 東海道の起点！", landmark: "日本橋" },
      { id: "odawara", name: "小田原", prefecture: "神奈川県", cumulative: 80, coordinates: { x: 75, y: 50 }, trivia: "🏯 小田原城と蒲鉾。", landmark: "小田原城" },
      { id: "hakone", name: "箱根", prefecture: "神奈川県", cumulative: 100, coordinates: { x: 73, y: 51 }, trivia: "♨️ 温泉と芦ノ湖の絶景。", landmark: "芦ノ湖" },
      { id: "numazu", name: "沼津", prefecture: "静岡県", cumulative: 130, coordinates: { x: 71, y: 52 }, trivia: "🦐 海鮮が美味しい港町。", landmark: "沼津港" },
      { id: "shizuoka_tokaido", name: "静岡", prefecture: "静岡県", cumulative: 200, coordinates: { x: 70, y: 53 }, trivia: "🗻 富士山ビュースポット！", landmark: "久能山東照宮" },
      { id: "hamamatsu", name: "浜松", prefecture: "静岡県", cumulative: 270, coordinates: { x: 68, y: 55 }, trivia: "🎸 楽器の街、うなぎも有名！", landmark: "浜松城" },
      { id: "nagoya_tokaido", name: "名古屋", prefecture: "愛知県", cumulative: 360, coordinates: { x: 66, y: 55 }, trivia: "🏯 金鯱が輝く名古屋城。", landmark: "名古屋城" },
      { id: "kuwana", name: "桑名", prefecture: "三重県", cumulative: 390, coordinates: { x: 64, y: 56 }, trivia: "🦪 蛤が名物の宿場町。", landmark: "六華苑" },
      { id: "otsu", name: "大津", prefecture: "滋賀県", cumulative: 470, coordinates: { x: 62, y: 58 }, trivia: "🌊 琵琶湖のほとり。", landmark: "琵琶湖" },
      { id: "kyoto_tokaido", name: "三条大橋", prefecture: "京都府", cumulative: 500, coordinates: { x: 62, y: 57 }, trivia: "🎊 東海道のゴール！お疲れ様でした！", landmark: "三条大橋" }
    ]
  },
  
  // 九州一周
  kyushu_loop: {
    id: 'kyushu_loop',
    name: '🌋 九州一周コース',
    description: '温泉と自然を満喫！約1,200km',
    totalDistance: 1200,
    difficulty: 'normal',
    estimatedDays: 150,
    startIcon: '🍜',
    goalIcon: '🎊',
    cities: [
      { id: "fukuoka_start", name: "福岡", prefecture: "福岡県", cumulative: 0, coordinates: { x: 38, y: 68 }, trivia: "🍜 博多ラーメンでスタート！", landmark: "太宰府天満宮" },
      { id: "saga", name: "佐賀", prefecture: "佐賀県", cumulative: 100, coordinates: { x: 36, y: 70 }, trivia: "🏺 有田焼の里。", landmark: "吉野ヶ里遺跡" },
      { id: "nagasaki", name: "長崎", prefecture: "長崎県", cumulative: 250, coordinates: { x: 33, y: 73 }, trivia: "⛪ 異国情緒あふれる港町。", landmark: "グラバー園" },
      { id: "kumamoto_kyushu", name: "熊本", prefecture: "熊本県", cumulative: 450, coordinates: { x: 37, y: 72 }, trivia: "🐻 くまモンに会える！", landmark: "熊本城" },
      { id: "kagoshima_kyushu", name: "鹿児島", prefecture: "鹿児島県", cumulative: 650, coordinates: { x: 35, y: 78 }, trivia: "🌋 桜島の雄大な景色。", landmark: "桜島" },
      { id: "miyazaki", name: "宮崎", prefecture: "宮崎県", cumulative: 850, coordinates: { x: 40, y: 75 }, trivia: "🌴 南国リゾート気分！", landmark: "高千穂峡" },
      { id: "oita", name: "大分", prefecture: "大分県", cumulative: 1050, coordinates: { x: 42, y: 70 }, trivia: "♨️ 別府温泉で極楽気分。", landmark: "別府温泉" },
      { id: "fukuoka_goal", name: "福岡（ゴール）", prefecture: "福岡県", cumulative: 1200, coordinates: { x: 38, y: 68 }, trivia: "🎊 九州一周達成！", landmark: "福岡タワー" }
    ]
  },
  
  // 北海道横断
  hokkaido_cross: {
    id: 'hokkaido_cross',
    name: '⛄ 北海道横断コース',
    description: '函館から稚内へ！最北端を目指す約700km',
    totalDistance: 700,
    difficulty: 'normal',
    estimatedDays: 90,
    startIcon: '🦑',
    goalIcon: '🦭',
    cities: [
      { id: "hakodate", name: "函館", prefecture: "北海道", cumulative: 0, coordinates: { x: 83, y: 20 }, trivia: "🦑 イカと夜景が有名！", landmark: "函館山" },
      { id: "sapporo_hokkaido", name: "札幌", prefecture: "北海道", cumulative: 300, coordinates: { x: 85, y: 12 }, trivia: "🍺 ビールとラーメン！", landmark: "時計台" },
      { id: "asahikawa", name: "旭川", prefecture: "北海道", cumulative: 450, coordinates: { x: 87, y: 10 }, trivia: "🐧 旭山動物園が大人気！", landmark: "旭山動物園" },
      { id: "wakkanai", name: "稚内", prefecture: "北海道", cumulative: 700, coordinates: { x: 88, y: 5 }, trivia: "🦭 日本最北端の街！", landmark: "宗谷岬" }
    ]
  },
  
  // フルマラソン
  marathon: {
    id: 'marathon',
    name: '🏃 フルマラソンコース',
    description: '42.195kmのマラソンに挑戦！',
    totalDistance: 42.195,
    difficulty: 'easy',
    estimatedDays: 7,
    startIcon: '🏁',
    goalIcon: '🥇',
    cities: [
      { id: "start", name: "スタート", prefecture: "", cumulative: 0, coordinates: { x: 10, y: 50 }, trivia: "🏁 マラソンスタート！", landmark: "スタートライン" },
      { id: "5k", name: "5km地点", prefecture: "", cumulative: 5, coordinates: { x: 20, y: 50 }, trivia: "💪 まだまだ序盤！", landmark: "5km" },
      { id: "10k", name: "10km地点", prefecture: "", cumulative: 10, coordinates: { x: 30, y: 50 }, trivia: "🎽 1/4到達！", landmark: "10km" },
      { id: "half", name: "ハーフ地点", prefecture: "", cumulative: 21.0975, coordinates: { x: 50, y: 50 }, trivia: "🎯 折り返し！", landmark: "ハーフ" },
      { id: "30k", name: "30km地点", prefecture: "", cumulative: 30, coordinates: { x: 70, y: 50 }, trivia: "😤 ここからが勝負！", landmark: "30km" },
      { id: "40k", name: "40km地点", prefecture: "", cumulative: 40, coordinates: { x: 85, y: 50 }, trivia: "🔥 ラストスパート！", landmark: "40km" },
      { id: "goal", name: "ゴール", prefecture: "", cumulative: 42.195, coordinates: { x: 95, y: 50 }, trivia: "🥇 完走おめでとう！", landmark: "ゴール" }
    ]
  }
};

/**
 * ルート管理オブジェクト
 */
const RouteManager = {
  currentRouteId: 'japan_traverse',
  
  /**
   * 全ルート一覧を取得
   */
  getAllRoutes() {
    return Object.values(ROUTES);
  },
  
  /**
   * ルートを取得
   */
  getRoute(routeId) {
    return ROUTES[routeId] || ROUTES.japan_traverse;
  },
  
  /**
   * 現在のルートを取得
   */
  getCurrentRoute() {
    return this.getRoute(this.currentRouteId);
  },
  
  /**
   * ルートを変更
   */
  setCurrentRoute(routeId) {
    if (ROUTES[routeId]) {
      this.currentRouteId = routeId;
      return true;
    }
    return false;
  },
  
  /**
   * ルートの進捗を計算
   */
  getRouteProgress(routeId, distance) {
    const route = this.getRoute(routeId);
    const cities = route.cities;
    
    // 完走チェック
    if (distance >= route.totalDistance) {
      return {
        currentCity: cities[cities.length - 1],
        nextCity: null,
        progress: 100,
        distanceToNext: 0,
        isCompleted: true,
        route
      };
    }
    
    // 現在地と次の都市を特定
    let currentCity = cities[0];
    let nextCity = cities[1];
    
    for (let i = 0; i < cities.length - 1; i++) {
      if (distance >= cities[i].cumulative && distance < cities[i + 1].cumulative) {
        currentCity = cities[i];
        nextCity = cities[i + 1];
        break;
      }
    }
    
    const distanceToNext = nextCity.cumulative - distance;
    const totalProgress = (distance / route.totalDistance) * 100;
    
    return {
      currentCity,
      nextCity,
      progress: totalProgress,
      distanceToNext,
      isCompleted: false,
      route
    };
  },
  
  /**
   * ルート選択UIを描画
   */
  renderRouteSelector(containerId, currentRouteId, currentDistance) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = '<div class="route-selector">';
    html += '<h4>🗺️ コースを選択</h4>';
    html += '<div class="route-list">';
    
    Object.values(ROUTES).forEach(route => {
      const isActive = route.id === currentRouteId;
      const progress = (currentDistance / route.totalDistance * 100).toFixed(1);
      const difficultyLabel = { easy: '初級', normal: '中級', hard: '上級' };
      const difficultyClass = route.difficulty;
      
      html += `
        <div class="route-option ${isActive ? 'active' : ''}" data-route-id="${route.id}">
          <div class="route-header">
            <span class="route-name">${route.name}</span>
            <span class="route-difficulty ${difficultyClass}">${difficultyLabel[route.difficulty]}</span>
          </div>
          <p class="route-description">${route.description}</p>
          <div class="route-info">
            <span>📏 ${route.totalDistance}km</span>
            <span>📅 目安${route.estimatedDays}日</span>
          </div>
          ${isActive ? `
            <div class="route-progress">
              <div class="route-progress-bar">
                <div class="route-progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
              </div>
              <span class="route-progress-text">${progress}%</span>
            </div>
          ` : `
            <button class="select-route-btn" data-route-id="${route.id}">このコースを選択</button>
          `}
        </div>
      `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ROUTES, RouteManager };
}
