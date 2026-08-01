/**
 * ご当地クイズ、ゴーストペーサー、年間振り返り、都市別演出。
 * クイズと振り返りは表示専用。ゴースト設定だけ settings.ghost に保存する。
 */

const FunExtras = {
  data: null,
  route: null,
  map: null,
  storage: null,
  bound: false,
  quizIndex: 0,
  wrappedSlide: 0,
  wrappedSlides: [],

  quizData: {
    okinawa: { question: '那覇の名所「首里城」は、かつてどの王国の中心だった？', options: ['琉球王国', '邪馬台国', '蝦夷共和国'], answer: 0 },
    kagoshima: { question: '鹿児島市街から見える活火山は？', options: ['阿蘇山', '桜島', '浅間山'], answer: 1 },
    kumamoto: { question: '熊本城の別名として知られるのは？', options: ['鶴ヶ城', '白鷺城', '銀杏城'], answer: 2 },
    fukuoka: { question: '福岡で親しまれている麺料理は？', options: ['盛岡冷麺', '讃岐うどん', '博多とんこつラーメン'], answer: 2 },
    hiroshima: { question: '厳島神社がある島の通称は？', options: ['佐渡島', '宮島', '淡路島'], answer: 1 },
    okayama: { question: '岡山と縁が深い昔話は？', options: ['桃太郎', '浦島太郎', '一寸法師'], answer: 0 },
    osaka: { question: '大阪名物の粉ものは？', options: ['たこ焼き', 'もんじゃ焼き', '明石焼きだけ'], answer: 0 },
    kyoto: { question: '金閣寺の正式名称は？', options: ['慈照寺', '鹿苑寺', '清水寺'], answer: 1 },
    nagoya: { question: '名古屋城の屋根で輝くものは？', options: ['銀の鶴', '銅の龍', '金の鯱'], answer: 2 },
    shizuoka: { question: '静岡県と山梨県にまたがる日本最高峰は？', options: ['北岳', '富士山', '槍ヶ岳'], answer: 1 },
    tokyo: { question: '東京タワーのイメージカラーに近いのは？', options: ['赤と白', '青と銀', '緑と金'], answer: 0 },
    sendai: { question: '仙台の愛称は？', options: ['水の都', '風の都', '杜の都'], answer: 2 },
    aomori: { question: '青森県が生産量日本一で知られる果物は？', options: ['みかん', 'りんご', 'ぶどう'], answer: 1 },
    sapporo: { question: '札幌の冬を代表するイベントは？', options: ['ねぶた祭', '祇園祭', 'さっぽろ雪まつり'], answer: 2 }
  },

  celebrationThemes: {
    okinawa: { colors: ['#ff4f87', '#ffb3c7', '#35b8a0'], shapes: ['🌺', '●', '◆'] },
    kagoshima: { colors: ['#ef4444', '#f97316', '#3f3f46'], shapes: ['🌋', '▲', '●'] },
    kumamoto: { colors: ['#111827', '#ef4444', '#fbbf24'], shapes: ['◆', '●', '★'] },
    fukuoka: { colors: ['#dc2626', '#f59e0b', '#fef3c7'], shapes: ['●', '◆', '★'] },
    hiroshima: { colors: ['#dc2626', '#ffffff', '#0f766e'], shapes: ['⛩', '◆', '●'] },
    okayama: { colors: ['#fb7185', '#fda4af', '#86efac'], shapes: ['🍑', '●', '◆'] },
    osaka: { colors: ['#f97316', '#facc15', '#ef4444'], shapes: ['★', '●', '◆'] },
    kyoto: { colors: ['#b91c1c', '#d97706', '#78350f'], shapes: ['◆', '❖', '●'] },
    nagoya: { colors: ['#facc15', '#111827', '#3b82f6'], shapes: ['★', '◆', '●'] },
    shizuoka: { colors: ['#38bdf8', '#ffffff', '#22c55e'], shapes: ['🗻', '◆', '●'] },
    tokyo: { colors: ['#ef4444', '#ffffff', '#64748b'], shapes: ['🗼', '◆', '●'] },
    sendai: { colors: ['#22c55e', '#84cc16', '#facc15'], shapes: ['◆', '🍃', '●'] },
    aomori: { colors: ['#ef4444', '#22c55e', '#fef3c7'], shapes: ['🍎', '●', '◆'] },
    sapporo: { colors: ['#dbeafe', '#ffffff', '#60a5fa'], shapes: ['❄', '❅', '●'] },
    default: { colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'], shapes: ['◆', '●', '★'] }
  },

  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  parseDate(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : null;
  },

  getTodayKey(now = new Date()) {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(now);
    } catch (_error) {
      return now.toISOString().slice(0, 10);
    }
  },

  getCelebrationTheme(cityId) {
    return this.celebrationThemes[cityId] || this.celebrationThemes.default;
  },

  init(data, route, map, storage) {
    this.data = data;
    this.route = route;
    this.map = map;
    this.storage = storage;
    this.bindEvents();
    this.render();
  },

  update(data) {
    this.data = data;
    this.render();
  },

  bindEvents() {
    if (this.bound) return;
    document.getElementById('quiz-container')?.addEventListener('click', event => {
      const answer = event.target.closest('[data-quiz-answer]');
      if (answer) this.answerQuiz(Number(answer.dataset.quizAnswer));
      if (event.target.closest('[data-next-quiz]')) {
        this.quizIndex++;
        this.renderQuiz();
      }
    });
    document.getElementById('save-ghost-btn')?.addEventListener('click', () => this.saveGhostSettings());
    document.getElementById('wrapped-open-btn')?.addEventListener('click', () => this.openWrapped());
    document.getElementById('wrapped-next-btn')?.addEventListener('click', () => this.changeWrappedSlide(1));
    document.getElementById('wrapped-prev-btn')?.addEventListener('click', () => this.changeWrappedSlide(-1));
    document.getElementById('wrapped-year')?.addEventListener('change', () => this.renderWrappedLauncher());
    this.bound = true;
  },

  render() {
    this.renderQuiz();
    this.renderGhostSettings();
    this.renderGhost();
    this.renderWrappedLauncher();
  },

  getReachedQuizCities() {
    if (!this.route) return [];
    const reached = new Set(this.data?.reachedCities || []);
    const distance = Number(this.data?.totalDistance) || 0;
    return this.route.cities.filter(city => this.quizData[city.id] && (city.cumulative === 0 || reached.has(city.id) || city.cumulative <= distance));
  },

  renderQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;
    const cities = this.getReachedQuizCities();
    if (cities.length === 0) {
      delete container.dataset.cityId;
      container.innerHTML = '<p class="fun-empty">このルートで遊べるクイズはありません。</p>';
      return;
    }
    const city = cities[this.quizIndex % cities.length];
    const quiz = this.quizData[city.id];
    container.dataset.cityId = city.id;
    container.innerHTML = `
      <div class="quiz-heading"><span>📍 ${this.escapeHtml(city.name)}編</span><small>${cities.length}都市 解放済み</small></div>
      <p class="quiz-question">${this.escapeHtml(quiz.question)}</p>
      <div class="quiz-options">
        ${quiz.options.map((option, index) => `<button type="button" data-quiz-answer="${index}">${index + 1}. ${this.escapeHtml(option)}</button>`).join('')}
      </div>
      <div class="quiz-feedback" aria-live="polite"></div>
    `;
  },

  answerQuiz(answerIndex) {
    const container = document.getElementById('quiz-container');
    const cityId = container?.dataset.cityId;
    const quiz = this.quizData[cityId];
    if (!container || !quiz) return;
    const correct = answerIndex === quiz.answer;
    container.querySelectorAll('[data-quiz-answer]').forEach((button, index) => {
      button.disabled = true;
      button.classList.toggle('correct', index === quiz.answer);
      button.classList.toggle('wrong', index === answerIndex && !correct);
    });
    const feedback = container.querySelector('.quiz-feedback');
    if (feedback) {
      feedback.innerHTML = `${correct ? '🎉 正解！' : '💡 惜しい！'} <button type="button" data-next-quiz>次の問題へ →</button>`;
    }
  },

  getGhostSettings() {
    const stored = this.storage?.getSettings?.().ghost || this.data?.settings?.ghost || {};
    return {
      enabled: stored.enabled === true,
      startDate: stored.startDate || this.data?.createdAt?.slice(0, 10) || this.getTodayKey(),
      dailyPace: Math.max(0.1, Number(stored.dailyPace) || 5)
    };
  },

  calculateGhostProgress(settings, currentDate = this.getTodayKey(), routeTotal = 3000) {
    const start = this.parseDate(settings?.startDate);
    const current = this.parseDate(currentDate);
    if (!settings?.enabled || !start || !current || current < start) {
      return { distance: 0, daysElapsed: 0 };
    }
    const daysElapsed = Math.floor((current - start) / (24 * 60 * 60 * 1000));
    return {
      daysElapsed,
      distance: Math.min(routeTotal, daysElapsed * Math.max(0, Number(settings.dailyPace) || 0))
    };
  },

  renderGhostSettings() {
    const enabled = document.getElementById('ghost-enabled');
    const startDate = document.getElementById('ghost-start-date');
    const dailyPace = document.getElementById('ghost-daily-pace');
    if (!enabled || !startDate || !dailyPace) return;
    const settings = this.getGhostSettings();
    enabled.checked = settings.enabled;
    startDate.value = settings.startDate;
    dailyPace.value = settings.dailyPace;
  },

  saveGhostSettings() {
    const settings = {
      enabled: Boolean(document.getElementById('ghost-enabled')?.checked),
      startDate: document.getElementById('ghost-start-date')?.value || this.getTodayKey(),
      dailyPace: Math.max(0.1, Number(document.getElementById('ghost-daily-pace')?.value) || 5)
    };
    this.storage?.saveSettings?.({ ghost: settings });
    if (this.data) this.data.settings = { ...(this.data.settings || {}), ghost: settings };
    this.renderGhost();
    const status = document.getElementById('ghost-status');
    if (status) status.textContent = '設定を保存しました。';
  },

  renderGhost() {
    const status = document.getElementById('ghost-lead');
    if (!status || !this.route) return;
    const settings = this.getGhostSettings();
    const ghost = this.calculateGhostProgress(settings, this.getTodayKey(), this.route.totalDistance);
    const userDistance = Number(this.data?.totalDistance) || 0;
    const difference = userDistance - ghost.distance;

    if (!settings.enabled) {
      status.textContent = 'ゴーストを有効にすると、毎日進む旅人と競争できます。';
      this.updateGhostMarker(null);
      return;
    }
    status.innerHTML = difference >= 0
      ? `👻 ゴーストより <strong>${difference.toFixed(1)}km リード</strong>（ゴースト ${ghost.distance.toFixed(1)}km）`
      : `👻 ゴーストを <strong>${Math.abs(difference).toFixed(1)}km 追走中</strong>（ゴースト ${ghost.distance.toFixed(1)}km）`;
    this.updateGhostMarker(ghost.distance);
  },

  updateGhostMarker(distance) {
    const svg = this.map?.svg;
    if (!svg) return;
    let marker = svg.querySelector('#ghost-pacer');
    if (distance === null) {
      marker?.remove();
      return;
    }
    if (!marker) {
      marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      marker.id = 'ghost-pacer';
      marker.setAttribute('class', 'ghost-pacer');
      marker.innerHTML = '<circle r="3.5" fill="#7c3aed" fill-opacity="0.6" stroke="#ffffff" stroke-width="1.2"></circle><text x="0" y="-6" text-anchor="middle" font-size="6">👻</text>';
      svg.appendChild(marker);
    }
    const position = this.map.getPositionOnRoute(distance);
    marker.setAttribute('transform', `translate(${position.x}, ${position.y})`);
  },

  getAvailableYears(records = []) {
    const years = [...new Set(records.map(record => Number(String(record.date || '').slice(0, 4))).filter(Boolean))].sort((a, b) => b - a);
    const currentYear = Number(this.getTodayKey().slice(0, 4));
    if (!years.includes(currentYear)) years.unshift(currentYear);
    return years;
  },

  calculateYearSummary(records = [], year, earnedBadges = []) {
    const selected = records.filter(record => Number(String(record.date || '').slice(0, 4)) === Number(year));
    const byDate = {};
    const byMonth = Array(12).fill(0);
    let runDistance = 0;
    let walkDistance = 0;
    selected.forEach(record => {
      const distance = Math.max(0, Number(record.distance) || 0);
      const date = String(record.date || '').slice(0, 10);
      byDate[date] = (byDate[date] || 0) + distance;
      const month = Number(date.slice(5, 7));
      if (month >= 1 && month <= 12) byMonth[month - 1] += distance;
      if (record.type === 'run') runDistance += distance;
      else if (record.type === 'walk') walkDistance += distance;
    });
    const dailyEntries = Object.entries(byDate).sort((left, right) => right[1] - left[1]);
    const bestMonthDistance = Math.max(0, ...byMonth);
    const bestMonthIndex = byMonth.indexOf(bestMonthDistance);
    return {
      year: Number(year),
      totalDistance: selected.reduce((sum, record) => sum + (Number(record.distance) || 0), 0),
      recordCount: selected.length,
      activeDays: Object.keys(byDate).length,
      longestDay: dailyEntries.length ? { date: dailyEntries[0][0], distance: dailyEntries[0][1] } : null,
      bestMonth: bestMonthDistance > 0 ? { month: bestMonthIndex + 1, distance: bestMonthDistance } : null,
      runDistance,
      walkDistance,
      badgeCount: Array.isArray(earnedBadges) ? earnedBadges.length : 0
    };
  },

  renderWrappedLauncher() {
    const yearSelect = document.getElementById('wrapped-year');
    const summaryElement = document.getElementById('wrapped-summary');
    if (!yearSelect || !summaryElement) return;
    const years = this.getAvailableYears(this.data?.records || []);
    const selectedYear = Number(yearSelect.value) || years[0];
    yearSelect.innerHTML = years.map(year => `<option value="${year}" ${year === selectedYear ? 'selected' : ''}>${year}年</option>`).join('');
    const summary = this.calculateYearSummary(this.data?.records || [], selectedYear, this.data?.earnedBadges || []);
    summaryElement.textContent = summary.recordCount > 0
      ? `${summary.activeDays}日活動・${summary.totalDistance.toFixed(1)}km。あなたの一年を5枚のカードで振り返ります。`
      : `${selectedYear}年の記録はまだありません。`;
    const button = document.getElementById('wrapped-open-btn');
    if (button) button.disabled = summary.recordCount === 0;
  },

  buildWrappedSlides(summary) {
    const longest = summary.longestDay;
    const bestMonth = summary.bestMonth;
    return [
      { kicker: `${summary.year} JOURNEY`, icon: '🗾', title: `${summary.totalDistance.toFixed(1)} km`, detail: `${summary.activeDays}日、${summary.recordCount}件の一歩を重ねました。` },
      { kicker: 'BEST DAY', icon: '☀️', title: longest ? `${longest.distance.toFixed(1)} km` : '—', detail: longest ? `${longest.date} が今年いちばん遠くへ進んだ日。` : '記録がありません。' },
      { kicker: 'BEST MONTH', icon: '📅', title: bestMonth ? `${bestMonth.month}月` : '—', detail: bestMonth ? `${bestMonth.distance.toFixed(1)}kmで、今年いちばんアクティブな月でした。` : '記録がありません。' },
      { kicker: 'YOUR STYLE', icon: '🏃', title: `RUN ${summary.runDistance.toFixed(1)}`, detail: `WALK ${summary.walkDistance.toFixed(1)}km。自分らしいペースで進みました。` },
      { kicker: 'COLLECTION', icon: '🏅', title: `${summary.badgeCount} badges`, detail: '集めたバッジと旅の記憶は、次の一歩への道しるべ。' }
    ];
  },

  openWrapped() {
    const year = Number(document.getElementById('wrapped-year')?.value) || new Date().getFullYear();
    const summary = this.calculateYearSummary(this.data?.records || [], year, this.data?.earnedBadges || []);
    if (summary.recordCount === 0) return;
    this.wrappedSlides = this.buildWrappedSlides(summary);
    this.wrappedSlide = 0;
    this.renderWrappedSlide();
    document.getElementById('wrapped-modal')?.classList.add('show');
  },

  changeWrappedSlide(delta) {
    if (this.wrappedSlides.length === 0) return;
    this.wrappedSlide = (this.wrappedSlide + delta + this.wrappedSlides.length) % this.wrappedSlides.length;
    this.renderWrappedSlide();
  },

  renderWrappedSlide() {
    const stage = document.getElementById('wrapped-stage');
    const counter = document.getElementById('wrapped-counter');
    const slide = this.wrappedSlides[this.wrappedSlide];
    if (!stage || !slide) return;
    stage.innerHTML = `
      <span class="wrapped-kicker">${this.escapeHtml(slide.kicker)}</span>
      <span class="wrapped-icon">${slide.icon}</span>
      <h3>${this.escapeHtml(slide.title)}</h3>
      <p>${this.escapeHtml(slide.detail)}</p>
    `;
    if (counter) counter.textContent = `${this.wrappedSlide + 1} / ${this.wrappedSlides.length}`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FunExtras;
}
