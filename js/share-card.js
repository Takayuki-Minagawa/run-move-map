/**
 * Canvas 2D だけで進捗カードを生成する。
 */

const ShareCard = {
  data: null,
  route: null,
  level: null,
  bound: false,

  buildSummary(data = {}, route = {}, levelInfo = {}) {
    const totalDistance = Math.max(0, Number(data.totalDistance) || 0);
    const routeTotal = Math.max(1, Number(route.totalDistance) || 3000);
    const cities = route.cities || [];
    let currentCity = cities[0] || { name: 'スタート' };
    cities.forEach(city => {
      if (city.cumulative <= totalDistance) currentCity = city;
    });
    const nextCity = cities.find(city => city.cumulative > totalDistance) || null;
    return {
      totalDistance,
      progress: Math.min(100, totalDistance / routeTotal * 100),
      currentCity: currentCity.name,
      nextCity: nextCity?.name || 'ゴール達成',
      levelName: levelInfo.current?.name || levelInfo.name || 'トラベラー',
      levelIcon: levelInfo.current?.icon || levelInfo.icon || '🗾',
      streakDays: Math.max(0, Number(data.streakDays) || 0),
      recordCount: data.records?.length || data.stats?.totalRecords || 0,
      routeTotal
    };
  },

  init(data, route, levelInfo) {
    this.data = data;
    this.route = route;
    this.level = levelInfo;
    if (!this.bound) {
      document.getElementById('share-download-btn')?.addEventListener('click', () => this.download());
      document.getElementById('share-native-btn')?.addEventListener('click', () => this.share());
      this.bound = true;
    }
    this.draw();
  },

  update(data, levelInfo) {
    this.data = data;
    this.level = levelInfo;
    this.draw();
  },

  roundedRect(context, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + safeRadius, y);
    context.arcTo(x + width, y, x + width, y + height, safeRadius);
    context.arcTo(x + width, y + height, x, y + height, safeRadius);
    context.arcTo(x, y + height, x, y, safeRadius);
    context.arcTo(x, y, x + width, y, safeRadius);
    context.closePath();
  },

  draw(canvas = document.getElementById('share-card-canvas')) {
    if (!canvas || !this.data || !this.route) return null;
    const context = canvas.getContext('2d');
    if (!context) return null;
    const summary = this.buildSummary(this.data, this.route, this.level || {});
    canvas.width = 1200;
    canvas.height = 630;

    const background = context.createLinearGradient(0, 0, 1200, 630);
    background.addColorStop(0, '#ff6b6b');
    background.addColorStop(0.55, '#ff8e72');
    background.addColorStop(1, '#4ecdc4');
    context.fillStyle = background;
    context.fillRect(0, 0, 1200, 630);

    context.globalAlpha = 0.12;
    context.fillStyle = '#ffffff';
    for (let index = 0; index < 16; index++) {
      context.beginPath();
      context.arc(70 + index * 84, 70 + (index % 3) * 180, 50 + (index % 4) * 12, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;

    this.roundedRect(context, 55, 48, 1090, 534, 42);
    context.fillStyle = 'rgba(255,255,255,0.94)';
    context.fill();

    context.fillStyle = '#31323a';
    context.font = '700 38px sans-serif';
    context.fillText('🗾 日本縦断チャレンジ', 105, 125);
    context.fillStyle = '#777b88';
    context.font = '500 24px sans-serif';
    context.fillText('毎日の一歩が、旅になる。', 105, 165);

    context.fillStyle = '#ff6b6b';
    context.font = '800 84px sans-serif';
    context.fillText(`${summary.totalDistance.toFixed(1)} km`, 100, 300);
    context.fillStyle = '#31323a';
    context.font = '700 34px sans-serif';
    context.fillText(`📍 ${summary.currentCity} → ${summary.nextCity}`, 105, 360);

    const barX = 105;
    const barY = 410;
    const barWidth = 990;
    this.roundedRect(context, barX, barY, barWidth, 34, 17);
    context.fillStyle = '#e7e8ed';
    context.fill();
    this.roundedRect(context, barX, barY, barWidth * summary.progress / 100, 34, 17);
    context.fillStyle = '#4ecdc4';
    context.fill();
    context.fillStyle = '#31323a';
    context.font = '700 26px sans-serif';
    context.fillText(`${summary.progress.toFixed(1)}%`, barX, 486);

    context.fillStyle = '#777b88';
    context.font = '600 23px sans-serif';
    context.fillText(`${summary.levelIcon} ${summary.levelName}`, 270, 486);
    context.fillText(`🔥 ${summary.streakDays}日`, 700, 486);
    context.fillText(`📝 ${summary.recordCount}記録`, 875, 486);
    context.fillStyle = '#a1a4ad';
    context.font = '500 18px sans-serif';
    context.fillText('#日本縦断チャレンジ', 105, 545);
    return summary;
  },

  canvasToBlob(canvas) {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95));
  },

  async download() {
    const canvas = document.getElementById('share-card-canvas');
    if (!canvas) return;
    this.draw(canvas);
    const link = document.createElement('a');
    link.download = `japan-journey-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    this.setStatus('PNG画像を保存しました。');
  },

  async share() {
    const canvas = document.getElementById('share-card-canvas');
    if (!canvas) return;
    this.draw(canvas);
    const blob = await this.canvasToBlob(canvas);
    if (!blob) return;
    const file = typeof File !== 'undefined' ? new File([blob], 'japan-journey.png', { type: 'image/png' }) : null;
    const shareData = {
      title: '日本縦断チャレンジ',
      text: `累計${this.data.totalDistance.toFixed(1)}kmまで旅しました！ #日本縦断チャレンジ`,
      ...(file ? { files: [file] } : {})
    };

    try {
      if (navigator.share && (!file || !navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        this.setStatus('共有メニューを開きました。');
      } else {
        await this.download();
        this.setStatus('このブラウザでは画像共有に未対応のため、PNGを保存しました。');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') this.setStatus('共有できませんでした。PNG保存をお試しください。');
    }
  },

  setStatus(message) {
    const status = document.getElementById('share-status');
    if (status) status.textContent = message;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShareCard;
}
