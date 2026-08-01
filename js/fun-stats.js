/**
 * 旅を楽しく見せる派生統計。
 * 保存データは変更せず、既存の records / totalDistance だけから計算する。
 */

const FunStats = {
  DAY_MS: 24 * 60 * 60 * 1000,

  missions: [
    { icon: '👟', title: 'まずは一歩', detail: '今日は合計1km以上を記録しよう', test: records => records.reduce((sum, record) => sum + (Number(record.distance) || 0), 0) >= 1 },
    { icon: '🌱', title: 'いつもより少し先へ', detail: '今日は合計3km以上を記録しよう', test: records => records.reduce((sum, record) => sum + (Number(record.distance) || 0), 0) >= 3 },
    { icon: '🚶', title: '景色を楽しむ日', detail: 'ウォーキングを1回記録しよう', test: records => records.some(record => record.type === 'walk') },
    { icon: '🏃', title: '風を切る日', detail: 'ランニングを1回記録しよう', test: records => records.some(record => record.type === 'run') },
    { icon: '📝', title: '旅の日記', detail: '今日の記録に一言メモを残そう', test: records => records.some(record => String(record.memo || '').trim()) },
    { icon: '✌️', title: '朝夕チャレンジ', detail: '今日は2回以上記録しよう', test: records => records.length >= 2 },
    { icon: '🔥', title: '5kmチャレンジ', detail: '今日は合計5km以上を記録しよう', test: records => records.reduce((sum, record) => sum + (Number(record.distance) || 0), 0) >= 5 }
  ],

  parseDate(value) {
    if (value instanceof Date) {
      return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    }
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return Number.isNaN(date.getTime()) ? null : date;
  },

  formatDateKey(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  },

  getTodayKey(now = new Date()) {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(now);
    } catch (_error) {
      return this.formatDateKey(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
    }
  },

  sumDistance(records = []) {
    return records.reduce((sum, record) => sum + (Number(record.distance) || 0), 0);
  },

  getDistanceConversions(distance) {
    const safeDistance = Math.max(0, Number(distance) || 0);
    return [
      {
        icon: '🏃',
        label: 'フルマラソン',
        value: safeDistance / 42.195,
        suffix: '回分',
        digits: 1
      },
      {
        icon: '🚄',
        label: '東京〜大阪',
        value: safeDistance / (506 * 2),
        suffix: '往復分',
        digits: 2
      },
      {
        icon: '🌏',
        label: '地球一周',
        value: safeDistance / 40075 * 100,
        suffix: '%',
        digits: 3
      },
      {
        icon: '🗻',
        label: '富士山の標高',
        value: safeDistance / 3.776,
        suffix: '回分',
        digits: 1
      }
    ];
  },

  calculateRecentPace(records = [], now = new Date(), days = 28) {
    const today = this.parseDate(now);
    if (!today || days < 1) return { dailyAverage: 0, distance: 0, days: 0, records: [] };

    const start = new Date(today.getTime() - (days - 1) * this.DAY_MS);
    const recent = records.filter(record => {
      const date = this.parseDate(record.date);
      return date && date >= start && date <= today;
    });
    if (recent.length === 0) return { dailyAverage: 0, distance: 0, days, records: [] };

    const firstDate = recent.reduce((earliest, record) => {
      const date = this.parseDate(record.date);
      return !earliest || date < earliest ? date : earliest;
    }, null);
    const observedDays = Math.min(days, Math.floor((today - firstDate) / this.DAY_MS) + 1);
    const distance = this.sumDistance(recent);

    return {
      dailyAverage: observedDays > 0 ? distance / observedDays : 0,
      distance,
      days: observedDays,
      records: recent
    };
  },

  addDays(date, days) {
    const parsed = this.parseDate(date);
    if (!parsed) return null;
    return new Date(parsed.getTime() + Math.max(0, days) * this.DAY_MS);
  },

  calculateArrivalForecast(totalDistance, records, route, now = new Date()) {
    const safeDistance = Math.max(0, Number(totalDistance) || 0);
    const cities = route?.cities || [];
    const total = Number(route?.totalDistance) || 0;
    const pace = this.calculateRecentPace(records, now, 28);
    const nextCity = cities.find(city => city.cumulative > safeDistance) || null;

    const makeTarget = (name, targetDistance) => {
      const remaining = Math.max(0, targetDistance - safeDistance);
      if (remaining === 0) return { name, remaining, days: 0, date: this.parseDate(now), completed: true };
      if (pace.dailyAverage <= 0) return { name, remaining, days: null, date: null, completed: false };
      const requiredDays = Math.ceil(remaining / pace.dailyAverage);
      return {
        name,
        remaining,
        days: requiredDays,
        date: this.addDays(now, requiredDays),
        completed: false
      };
    };

    return {
      pace,
      next: nextCity ? makeTarget(nextCity.name, nextCity.cumulative) : null,
      goal: total > 0 ? makeTarget(cities[cities.length - 1]?.name || 'ゴール', total) : null
    };
  },

  getAnniversaryMemory(records = [], baseDate = new Date()) {
    const today = this.parseDate(baseDate);
    if (!today) return null;
    const targetYear = today.getUTCFullYear() - 1;
    const month = today.getUTCMonth();
    const maxDay = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate();
    const target = new Date(Date.UTC(targetYear, month, Math.min(today.getUTCDate(), maxDay)));
    const targetKey = this.formatDateKey(target);
    const matches = records.filter(record => String(record.date || '').slice(0, 10) === targetKey);
    if (matches.length === 0) return null;

    return {
      date: targetKey,
      distance: this.sumDistance(matches),
      records: matches,
      memos: matches.map(record => String(record.memo || '').trim()).filter(Boolean)
    };
  },

  interpolateGeoPosition(distance, cities = []) {
    const usableCities = cities.filter(city => city.geo && Number.isFinite(city.geo.lat) && Number.isFinite(city.geo.lng));
    if (usableCities.length === 0) return null;
    const safeDistance = Math.max(0, Number(distance) || 0);
    if (safeDistance <= usableCities[0].cumulative) return { ...usableCities[0].geo };
    const last = usableCities[usableCities.length - 1];
    if (safeDistance >= last.cumulative) return { ...last.geo };

    for (let index = 0; index < usableCities.length - 1; index++) {
      const from = usableCities[index];
      const to = usableCities[index + 1];
      if (safeDistance >= from.cumulative && safeDistance <= to.cumulative) {
        const ratio = (safeDistance - from.cumulative) / (to.cumulative - from.cumulative);
        return {
          lat: from.geo.lat + (to.geo.lat - from.geo.lat) * ratio,
          lng: from.geo.lng + (to.geo.lng - from.geo.lng) * ratio
        };
      }
    }
    return { ...last.geo };
  },

  buildMapLinks(position) {
    if (!position) return null;
    const lat = Number(position.lat).toFixed(6);
    const lng = Number(position.lng).toFixed(6);
    return {
      map: `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`,
      streetView: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat}%2C${lng}`
    };
  },

  hashDate(dateKey) {
    return String(dateKey).split('').reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
  },

  getDailyMission(records = [], date = new Date()) {
    const dateKey = typeof date === 'string' ? date.slice(0, 10) : this.getTodayKey(date);
    const mission = this.missions[this.hashDate(dateKey) % this.missions.length];
    const todayRecords = records.filter(record => String(record.date || '').slice(0, 10) === dateKey);
    return {
      ...mission,
      date: dateKey,
      completed: Boolean(mission.test(todayRecords)),
      progressDistance: this.sumDistance(todayRecords),
      recordCount: todayRecords.length
    };
  },

  formatJapaneseDate(date) {
    const parsed = this.parseDate(date);
    if (!parsed) return '—';
    return `${parsed.getUTCFullYear()}年${parsed.getUTCMonth() + 1}月${parsed.getUTCDate()}日`;
  },

  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  render(data, route = (typeof ROUTE_DATA !== 'undefined' ? ROUTE_DATA : null)) {
    this.renderConversions(data?.totalDistance || 0);
    this.renderForecast(data || {}, route);
    this.renderMemory(data?.records || []);
    this.renderLocationLinks(data?.totalDistance || 0, route);
    this.renderMission(data?.records || []);
  },

  renderConversions(distance) {
    const container = document.getElementById('fun-conversions');
    if (!container) return;
    container.innerHTML = this.getDistanceConversions(distance).map(item => `
      <div class="fun-metric">
        <span class="fun-metric-icon">${item.icon}</span>
        <span class="fun-metric-value">${item.value.toFixed(item.digits)}${item.suffix}</span>
        <span class="fun-metric-label">${item.label}</span>
      </div>
    `).join('');
  },

  renderForecast(data, route) {
    const container = document.getElementById('arrival-forecast');
    if (!container || !route) return;
    const forecast = this.calculateArrivalForecast(data.totalDistance, data.records || [], route, this.getTodayKey());
    if (forecast.goal?.completed) {
      container.innerHTML = '<div class="forecast-complete">🏆 ゴール到着済み！ 次の旅も楽しみましょう。</div>';
      return;
    }
    if (forecast.pace.dailyAverage <= 0) {
      container.innerHTML = '<p class="fun-empty">直近28日に記録すると、到着予測が表示されます。</p>';
      return;
    }
    const rows = [forecast.next, forecast.goal].filter(Boolean);
    container.innerHTML = `
      <p class="forecast-pace">直近${forecast.pace.days}日の日平均 <strong>${forecast.pace.dailyAverage.toFixed(2)}km</strong></p>
      <div class="forecast-grid">
        ${rows.map((target, index) => `
          <div class="forecast-item">
            <span>${index === 0 ? '🎯 次の都市' : '🏁 ゴール'}・${this.escapeHtml(target.name)}</span>
            <strong>${this.formatJapaneseDate(target.date)}</strong>
            <small>あと${target.remaining.toFixed(1)}km／約${target.days}日</small>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderMemory(records) {
    const container = document.getElementById('anniversary-memory');
    if (!container) return;
    const memory = this.getAnniversaryMemory(records, this.getTodayKey());
    if (!memory) {
      container.innerHTML = '<span class="memory-icon">🕰️</span><div><strong>旅の思い出</strong><p>1年前の記録がある日に、ここへ思い出が届きます。</p></div>';
      container.classList.remove('has-memory');
      return;
    }
    const memo = memory.memos.length ? `「${this.escapeHtml(memory.memos[0])}」` : 'その日の一歩が、今の旅につながっています。';
    container.innerHTML = `
      <span class="memory-icon">💌</span>
      <div><strong>1年前の今日は ${memory.distance.toFixed(1)}km</strong><p>${memo}</p></div>
    `;
    container.classList.add('has-memory');
  },

  renderLocationLinks(distance, route) {
    const container = document.getElementById('current-location-links');
    if (!container || !route) return;
    const position = this.interpolateGeoPosition(distance, route.cities);
    const links = this.buildMapLinks(position);
    if (!links) {
      container.hidden = true;
      return;
    }
    container.hidden = false;
    container.innerHTML = `
      <a href="${links.map}" target="_blank" rel="noopener noreferrer">🗺️ Googleマップ</a>
      <a href="${links.streetView}" target="_blank" rel="noopener noreferrer">👀 ストリートビュー</a>
    `;
  },

  renderMission(records) {
    const container = document.getElementById('daily-mission');
    if (!container) return;
    const mission = this.getDailyMission(records, this.getTodayKey());
    container.classList.toggle('mission-complete', mission.completed);
    container.innerHTML = `
      <span class="mission-fortune">今日のおみくじ</span>
      <span class="mission-icon">${mission.completed ? '✅' : mission.icon}</span>
      <div><strong>${this.escapeHtml(mission.title)}</strong><p>${mission.completed ? '達成！ 今日の一歩を記録しました。' : this.escapeHtml(mission.detail)}</p></div>
    `;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FunStats;
}
