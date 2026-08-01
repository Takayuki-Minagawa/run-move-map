/**
 * 到達済み都市から絵はがきと御朱印帳を生成する表示専用モジュール。
 */

const Postcards = {
  landmarkIcons: {
    okinawa: '🏯',
    kagoshima: '🌋',
    kumamoto: '🏯',
    fukuoka: '⛩️',
    hiroshima: '⛩️',
    okayama: '🏘️',
    osaka: '🏯',
    kyoto: '🛕',
    nagoya: '🏯',
    shizuoka: '🗻',
    tokyo: '🗼',
    sendai: '🌿',
    aomori: '🍎',
    sapporo: '🕰️'
  },

  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  calculateReachDates(records = [], cities = []) {
    const sorted = [...records].sort((left, right) => {
      const dateOrder = String(left.date || '').localeCompare(String(right.date || ''));
      if (dateOrder !== 0) return dateOrder;
      const createdOrder = String(left.createdAt || '').localeCompare(String(right.createdAt || ''));
      return createdOrder !== 0 ? createdOrder : (Number(left.id) || 0) - (Number(right.id) || 0);
    });
    const reachDates = {};
    let cumulative = 0;
    let cityIndex = cities[0]?.cumulative === 0 ? 1 : 0;

    if (cities[0]?.cumulative === 0 && sorted.length > 0) {
      reachDates[cities[0].id] = String(sorted[0].date || '').slice(0, 10) || null;
    }

    sorted.forEach(record => {
      cumulative += Math.max(0, Number(record.distance) || 0);
      while (cityIndex < cities.length && cumulative >= cities[cityIndex].cumulative) {
        reachDates[cities[cityIndex].id] = String(record.date || '').slice(0, 10) || null;
        cityIndex++;
      }
    });

    return reachDates;
  },

  getUnlockedCityIds(data = {}, cities = []) {
    const stored = new Set(Array.isArray(data.reachedCities) ? data.reachedCities : []);
    const totalDistance = Math.max(0, Number(data.totalDistance) || 0);
    return new Set(cities.filter(city => city.cumulative === 0 || stored.has(city.id) || city.cumulative <= totalDistance).map(city => city.id));
  },

  getPostcardCollection(data = {}, cities = []) {
    const reachedDates = this.calculateReachDates(data.records || [], cities);
    const unlocked = this.getUnlockedCityIds(data, cities);
    return cities.filter(city => unlocked.has(city.id)).map(city => ({
      ...city,
      reachedDate: reachedDates[city.id] || null,
      icon: this.landmarkIcons[city.id] || '📍'
    }));
  },

  formatDate(date) {
    const match = String(date || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[1]}.${Number(match[2])}.${Number(match[3])}` : 'START';
  },

  render(data, route = (typeof ROUTE_DATA !== 'undefined' ? ROUTE_DATA : null)) {
    if (!route) return;
    this.renderPostcards(data, route.cities);
    this.renderStampBook(data, route.cities);
  },

  renderPostcards(data, cities) {
    const container = document.getElementById('postcard-gallery');
    if (!container) return;
    const collection = this.getPostcardCollection(data, cities);
    if (collection.length === 0) {
      container.innerHTML = '<p class="fun-empty">都市に到着すると、旅先から絵はがきが届きます。</p>';
      return;
    }

    container.innerHTML = collection.map((city, index) => `
      <article class="postcard" style="--postcard-hue: ${index * 31 % 360}deg">
        <div class="postcard-picture" role="img" aria-label="${this.escapeHtml(city.landmark)}のイラスト">
          <span class="postcard-sun"></span>
          <span class="postcard-landmark">${city.icon}</span>
          <span class="postcard-silhouette"></span>
        </div>
        <div class="postcard-copy">
          <span class="postcard-label">JOURNEY POST</span>
          <h4>${this.escapeHtml(city.name)} <small>${this.escapeHtml(city.prefecture)}</small></h4>
          <p>${this.escapeHtml(city.trivia)}</p>
          <div class="postcard-footer">
            <span>${this.escapeHtml(city.landmark)}</span>
            <time>${this.formatDate(city.reachedDate)}</time>
          </div>
        </div>
      </article>
    `).join('');
  },

  renderStampBook(data, cities) {
    const container = document.getElementById('stamp-book');
    if (!container) return;
    const unlocked = this.getUnlockedCityIds(data, cities);
    const reachedDates = this.calculateReachDates(data.records || [], cities);

    container.innerHTML = cities.map((city, index) => {
      const reached = unlocked.has(city.id);
      return `
        <div class="goshuin-page ${reached ? 'reached' : 'locked'}">
          <span class="goshuin-number">${String(index + 1).padStart(2, '0')}</span>
          <div class="goshuin-stamp" aria-label="${reached ? `${city.name} 到達済み` : `${city.name} 未到達`}">
            <span>${reached ? '旅' : '未'}</span>
            <strong>${this.escapeHtml(city.name)}</strong>
          </div>
          <small>${reached ? this.formatDate(reachedDates[city.id]) : `${city.cumulative}km`}</small>
        </div>
      `;
    }).join('');
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Postcards;
}
