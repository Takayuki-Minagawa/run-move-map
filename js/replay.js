/**
 * records を時系列にたどり、地図上の旅を再生する。
 */

const JourneyReplay = {
  animationId: null,
  isPlaying: false,
  data: null,
  map: null,
  route: null,
  bound: false,

  buildTimeline(records = [], totalDistance = 0, routeTotal = 3000) {
    const sorted = [...records].sort((left, right) => {
      const dateOrder = String(left.date || '').localeCompare(String(right.date || ''));
      return dateOrder !== 0 ? dateOrder : (Number(left.id) || 0) - (Number(right.id) || 0);
    });
    const grouped = new Map();
    sorted.forEach(record => {
      const key = String(record.date || '').slice(0, 10) || '日付不明';
      grouped.set(key, (grouped.get(key) || 0) + Math.max(0, Number(record.distance) || 0));
    });

    let cumulative = 0;
    const frames = [{ date: null, distance: 0, addedDistance: 0, label: '那覇からスタート' }];
    grouped.forEach((distance, date) => {
      cumulative = Math.min(routeTotal, cumulative + distance);
      frames.push({
        date,
        distance: cumulative,
        addedDistance: distance,
        label: `${date.slice(0, 7)}・${distance.toFixed(1)}km`
      });
    });

    const safeTotal = Math.min(routeTotal, Math.max(0, Number(totalDistance) || 0));
    if (safeTotal > cumulative) {
      frames.push({ date: null, distance: safeTotal, addedDistance: safeTotal - cumulative, label: '現在地' });
    }
    return frames;
  },

  init(data, map, route = (typeof ROUTE_DATA !== 'undefined' ? ROUTE_DATA : null)) {
    this.data = data;
    this.map = map;
    this.route = route;
    const button = document.getElementById('replay-btn');
    if (button && !this.bound) {
      button.addEventListener('click', () => {
        if (this.isPlaying) this.stop(true);
        else this.start();
      });
      this.bound = true;
    }
    this.renderSummary();
  },

  update(data) {
    this.data = data;
    this.renderSummary();
  },

  renderSummary() {
    const summary = document.getElementById('replay-summary');
    const button = document.getElementById('replay-btn');
    if (!summary || !button || !this.data) return;
    const recordCount = this.data.records?.length || 0;
    summary.textContent = recordCount > 0
      ? `${recordCount}件の記録を、那覇から現在地まで約8秒で再生します。`
      : '記録を追加すると、ここから旅を振り返れます。';
    button.disabled = recordCount === 0;
  },

  start() {
    if (this.isPlaying || !this.data || !this.map || !this.route) return;
    const frames = this.buildTimeline(this.data.records, this.data.totalDistance, this.route.totalDistance);
    if (frames.length <= 1) return;

    const prefersReducedMotion = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 1200 : 8000;
    const startedAt = performance.now();
    this.isPlaying = true;
    this.setPlayingState(true);
    document.querySelector('.map-section')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });

    const animate = now => {
      if (!this.isPlaying) return;
      const progress = Math.min(1, (now - startedAt) / duration);
      const scaled = progress * (frames.length - 1);
      const index = Math.min(frames.length - 2, Math.floor(scaled));
      const localProgress = scaled - index;
      const from = frames[index];
      const to = frames[index + 1];
      const distance = from.distance + (to.distance - from.distance) * localProgress;

      this.map.updateCurrentLocation(distance);
      this.map.updateTraveledPath(Math.min(distance / this.route.totalDistance, 1));
      this.setStatus(to.label, distance, progress);

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.finish();
      }
    };

    this.animationId = requestAnimationFrame(animate);
  },

  setStatus(label, distance, progress) {
    const labelElement = document.getElementById('replay-label');
    const progressElement = document.getElementById('replay-progress');
    if (labelElement) labelElement.textContent = `${label}｜累計 ${distance.toFixed(1)}km`;
    if (progressElement) progressElement.style.width = `${progress * 100}%`;
  },

  setPlayingState(playing) {
    const button = document.getElementById('replay-btn');
    const player = document.getElementById('replay-player');
    if (button) button.textContent = playing ? '■ 再生を止める' : '▶ 旅を振り返る';
    if (player) player.classList.toggle('playing', playing);
  },

  finish() {
    this.isPlaying = false;
    this.animationId = null;
    this.setPlayingState(false);
    this.setStatus('現在地に到着！', this.data.totalDistance, 1);
    this.map.update(this.data.totalDistance, this.data.reachedCities || []);
  },

  stop(restore = true) {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.animationId = null;
    this.isPlaying = false;
    this.setPlayingState(false);
    if (restore && this.map && this.data) {
      this.map.update(this.data.totalDistance, this.data.reachedCities || []);
      this.setStatus('再生を停止しました', this.data.totalDistance, 0);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JourneyReplay;
}
