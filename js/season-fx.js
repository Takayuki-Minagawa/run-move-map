/**
 * 地図に軽量な季節パーティクルを重ねる。設定だけ settings.seasonFx に保存する。
 */

const SeasonFx = {
  enabled: true,
  storage: null,
  bound: false,
  currentDate: null,
  seasons: {
    spring: { label: '春・桜', particles: ['🌸', '❀', '🌸'], className: 'season-spring' },
    summer: { label: '夏・波', particles: ['·', '◌', '〜'], className: 'season-summer' },
    autumn: { label: '秋・紅葉', particles: ['🍁', '🍂', '◆'], className: 'season-autumn' },
    winter: { label: '冬・雪', particles: ['❄', '·', '❅'], className: 'season-winter' }
  },

  getSeason(month) {
    const numericMonth = Number(month);
    if ([3, 4, 5].includes(numericMonth)) return 'spring';
    if ([6, 7, 8].includes(numericMonth)) return 'summer';
    if ([9, 10, 11].includes(numericMonth)) return 'autumn';
    return 'winter';
  },

  getMonth(date = new Date()) {
    if (typeof date === 'string') {
      const match = date.match(/^\d{4}-(\d{2})/);
      if (match) return Number(match[1]);
    }
    return date instanceof Date ? date.getMonth() + 1 : new Date().getMonth() + 1;
  },

  getLatestRecordDate(records = []) {
    const list = Array.isArray(records) ? records : [];
    return list.reduce((latest, record) => {
      const date = String(record?.date || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return latest;
      return !latest || date > latest ? date : latest;
    }, null);
  },

  init(data, storage) {
    this.storage = storage;
    const settings = storage?.getSettings?.() || {};
    this.enabled = settings.seasonFx !== false;
    this.currentDate = this.getLatestRecordDate(data?.records) || new Date();

    const toggle = document.getElementById('season-fx-toggle');
    if (toggle) {
      toggle.checked = this.enabled;
      if (!this.bound) {
        toggle.addEventListener('change', event => {
          this.enabled = event.target.checked;
          this.storage?.saveSettings?.({ seasonFx: this.enabled });
          this.render(this.currentDate);
        });
        this.bound = true;
      }
    }
    this.render(this.currentDate);
  },

  update(data) {
    this.currentDate = this.getLatestRecordDate(data?.records) || new Date();
    this.render(this.currentDate);
  },

  render(date) {
    const container = document.getElementById('season-fx');
    const label = document.getElementById('season-fx-label');
    const badge = document.getElementById('season-fx-badge') || label?.closest('.season-fx-badge');
    if (!container) return;
    container.replaceChildren();
    container.className = 'season-fx';
    container.hidden = !this.enabled;
    if (badge) badge.hidden = !this.enabled;
    if (!this.enabled) {
      if (label) label.textContent = 'OFF';
      return;
    }

    const seasonKey = this.getSeason(this.getMonth(date));
    const season = this.seasons[seasonKey];
    container.classList.add(season.className);
    if (label) label.textContent = season.label;

    const reducedMotion = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = reducedMotion ? 6 : 18;
    for (let index = 0; index < count; index++) {
      const particle = document.createElement('span');
      particle.className = 'season-particle';
      particle.textContent = season.particles[index % season.particles.length];
      particle.style.setProperty('--particle-left', `${(index * 37 + 7) % 100}%`);
      particle.style.setProperty('--particle-delay', `${-(index % 9) * 0.7}s`);
      particle.style.setProperty('--particle-duration', `${5 + index % 5}s`);
      particle.style.setProperty('--particle-drift', `${(index % 2 ? 1 : -1) * (14 + index % 4 * 7)}px`);
      container.appendChild(particle);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SeasonFx;
}
