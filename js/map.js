/**
 * 地図描画・更新機能
 */

const JapanMap = {
  // 都市の座標マッピング（SVG内の座標）
  cityCoordinates: {
    okinawa: { x: 22, y: 92 },
    kagoshima: { x: 32, y: 78 },
    kumamoto: { x: 35, y: 74 },
    fukuoka: { x: 36, y: 70 },
    hiroshima: { x: 48, y: 65 },
    okayama: { x: 55, y: 60 },
    osaka: { x: 62, y: 57 },
    kyoto: { x: 65, y: 54 },
    nagoya: { x: 68, y: 54 },
    shizuoka: { x: 75, y: 50 },
    tokyo: { x: 80, y: 42 },
    sendai: { x: 82, y: 35 },
    aomori: { x: 82, y: 26 },
    sapporo: { x: 85, y: 15 }
  },
  
  // ルートポイント（SVGパスの順番に対応）
  routePoints: [
    { id: 'okinawa', x: 22, y: 92, distance: 0 },
    { id: 'kagoshima', x: 32, y: 78, distance: 650 },
    { id: 'kumamoto', x: 35, y: 74, distance: 800 },
    { id: 'fukuoka', x: 36, y: 70, distance: 920 },
    { id: 'hiroshima', x: 48, y: 65, distance: 1100 },
    { id: 'okayama', x: 55, y: 60, distance: 1200 },
    { id: 'osaka', x: 62, y: 57, distance: 1350 },
    { id: 'kyoto', x: 65, y: 54, distance: 1400 },
    { id: 'nagoya', x: 68, y: 54, distance: 1550 },
    { id: 'shizuoka', x: 75, y: 50, distance: 1700 },
    { id: 'tokyo', x: 80, y: 42, distance: 1880 },
    { id: 'sendai', x: 82, y: 35, distance: 2230 },
    { id: 'aomori', x: 82, y: 26, distance: 2530 },
    { id: 'sapporo', x: 85, y: 15, distance: 3000 }
  ],
  
  /**
   * SVGを読み込んでDOMに挿入
   */
  async init(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
      const response = await fetch('assets/japan-map.svg');
      const svgText = await response.text();
      container.innerHTML = svgText;
      
      // SVG要素を取得
      this.svg = container.querySelector('svg');
      this.traveledPath = this.svg.querySelector('#traveled-path');
      this.currentLocation = this.svg.querySelector('#current-location');
      
      // パスの全長を計算
      if (this.traveledPath) {
        this.totalPathLength = this.traveledPath.getTotalLength();
        this.traveledPath.style.strokeDasharray = `0 ${this.totalPathLength}`;
      }
      
    } catch (e) {
      console.error('地図の読み込みに失敗しました:', e);
      container.innerHTML = '<p>地図を読み込めませんでした</p>';
    }
  },
  
  /**
   * 累計距離に基づいて地図を更新
   * @param {number} distance - 累計距離(km)
   * @param {array} reachedCities - 到達済み都市IDの配列
   */
  update(distance, reachedCities = []) {
    if (!this.svg) return;
    
    // 進捗率を計算（0-1）
    const progress = Math.min(distance / 3000, 1);
    
    // 通過済みルートを描画
    this.updateTraveledPath(progress);
    
    // 現在地マーカーを移動
    this.updateCurrentLocation(distance);
    
    // 到達済み都市をハイライト
    this.updateCityMarkers(reachedCities);
  },
  
  /**
   * 通過済みルートの更新
   */
  updateTraveledPath(progress) {
    if (!this.traveledPath || !this.totalPathLength) return;
    
    const traveledLength = this.totalPathLength * progress;
    this.traveledPath.style.strokeDasharray = `${traveledLength} ${this.totalPathLength}`;
  },
  
  /**
   * 現在地マーカーの位置更新
   */
  updateCurrentLocation(distance) {
    if (!this.currentLocation || !this.traveledPath) return;
    
    const position = this.getPositionOnRoute(distance);
    this.currentLocation.setAttribute('transform', `translate(${position.x}, ${position.y})`);
  },
  
  /**
   * 距離に基づいてルート上の座標を計算
   */
  getPositionOnRoute(distance) {
    const points = this.routePoints;
    
    // 完走した場合
    if (distance >= 3000) {
      return { x: points[points.length - 1].x, y: points[points.length - 1].y };
    }
    
    // 現在の区間を特定
    let fromPoint = points[0];
    let toPoint = points[1];
    
    for (let i = 0; i < points.length - 1; i++) {
      if (distance >= points[i].distance && distance < points[i + 1].distance) {
        fromPoint = points[i];
        toPoint = points[i + 1];
        break;
      }
    }
    
    // 区間内の進捗率
    const segmentLength = toPoint.distance - fromPoint.distance;
    const segmentProgress = (distance - fromPoint.distance) / segmentLength;
    
    // 線形補間で座標を計算
    const x = fromPoint.x + (toPoint.x - fromPoint.x) * segmentProgress;
    const y = fromPoint.y + (toPoint.y - fromPoint.y) * segmentProgress;
    
    return { x, y };
  },
  
  /**
   * 都市マーカーの更新
   */
  updateCityMarkers(reachedCities) {
    if (!this.svg) return;
    
    const markers = this.svg.querySelectorAll('.city-marker');
    
    markers.forEach(marker => {
      const cityId = marker.dataset.city;
      const circle = marker.querySelector('circle');
      
      if (reachedCities.includes(cityId)) {
        // 到達済み：ハイライト
        circle.setAttribute('fill', '#ff6b6b');
        circle.setAttribute('stroke', '#ff6b6b');
        marker.classList.add('reached');
      } else {
        // 未到達：グレー
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('stroke', '#999');
        marker.classList.remove('reached');
      }
    });
  },
  
  /**
   * 都市到達アニメーション
   */
  animateCityReached(cityId) {
    if (!this.svg) return;
    
    const marker = this.svg.querySelector(`[data-city="${cityId}"]`);
    if (!marker) return;
    
    const circle = marker.querySelector('circle');
    
    // パルスアニメーション
    circle.classList.add('city-reached-animation');
    
    setTimeout(() => {
      circle.classList.remove('city-reached-animation');
    }, 1000);
  },
  
  /**
   * ゴール演出
   */
  celebrateGoal() {
    if (!this.svg) return;
    
    // ゴールマーカーを強調
    const goalMarker = this.svg.querySelector('[data-city="sapporo"]');
    if (goalMarker) {
      goalMarker.classList.add('goal-reached');
    }
    
    // SVG全体にお祝いクラスを追加
    this.svg.classList.add('goal-celebration');
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JapanMap;
}
