/**
 * カレンダービュー機能
 * 記録した日を視覚的に表示（GitHubの草スタイル）
 */

const Calendar = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  
  /**
   * カレンダーを初期化
   * @param {string} containerId - コンテナ要素のID
   * @param {array} records - 記録データの配列
   */
  init(containerId, records) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.records = records;
    this.render();
  },
  
  /**
   * カレンダーを描画
   */
  render() {
    if (!this.container) return;
    
    const year = this.currentYear;
    const month = this.currentMonth;
    
    // 月の最初と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // 月名
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', 
                        '7月', '8月', '9月', '10月', '11月', '12月'];
    
    let html = `
      <div class="calendar-header">
        <button class="calendar-nav" id="prev-month">◀</button>
        <span class="calendar-title">${year}年 ${monthNames[month]}</span>
        <button class="calendar-nav" id="next-month">▶</button>
      </div>
      <div class="calendar-weekdays">
        <span class="weekday sun">日</span>
        <span class="weekday">月</span>
        <span class="weekday">火</span>
        <span class="weekday">水</span>
        <span class="weekday">木</span>
        <span class="weekday">金</span>
        <span class="weekday sat">土</span>
      </div>
      <div class="calendar-grid">
    `;
    
    // 空白セル（月初め前）
    for (let i = 0; i < startDayOfWeek; i++) {
      html += '<div class="calendar-day empty"></div>';
    }
    
    // 日付セル
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayRecords = this.records.filter(r => r.date === dateStr);
      const totalDistance = dayRecords.reduce((sum, r) => sum + r.distance, 0);
      
      const cellDate = new Date(year, month, day);
      const isToday = cellDate.getTime() === today.getTime();
      const isFuture = cellDate > today;
      const dayOfWeek = cellDate.getDay();
      
      // 強度レベル（距離に応じて色を変える）
      let intensityClass = '';
      if (totalDistance > 0) {
        if (totalDistance >= 20) intensityClass = 'level-4';
        else if (totalDistance >= 10) intensityClass = 'level-3';
        else if (totalDistance >= 5) intensityClass = 'level-2';
        else intensityClass = 'level-1';
      }
      
      const weekendClass = dayOfWeek === 0 ? 'sun' : (dayOfWeek === 6 ? 'sat' : '');
      
      html += `
        <div class="calendar-day ${intensityClass} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''} ${weekendClass}"
             data-date="${dateStr}" 
             data-distance="${totalDistance.toFixed(1)}"
             title="${totalDistance > 0 ? `${totalDistance.toFixed(1)}km` : '記録なし'}">
          <span class="day-number">${day}</span>
          ${totalDistance > 0 ? `<span class="day-distance">${totalDistance.toFixed(1)}</span>` : ''}
        </div>
      `;
    }
    
    html += '</div>';
    
    // 凡例
    html += `
      <div class="calendar-legend">
        <span class="legend-label">少</span>
        <span class="legend-box level-0"></span>
        <span class="legend-box level-1"></span>
        <span class="legend-box level-2"></span>
        <span class="legend-box level-3"></span>
        <span class="legend-box level-4"></span>
        <span class="legend-label">多</span>
      </div>
    `;
    
    // 月間統計
    const monthRecords = this.records.filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const monthTotal = monthRecords.reduce((sum, r) => sum + r.distance, 0);
    const activeDays = new Set(monthRecords.map(r => r.date)).size;
    
    html += `
      <div class="calendar-stats">
        <div class="calendar-stat">
          <span class="stat-value">${monthTotal.toFixed(1)}</span>
          <span class="stat-label">km / 月</span>
        </div>
        <div class="calendar-stat">
          <span class="stat-value">${activeDays}</span>
          <span class="stat-label">日 / 月</span>
        </div>
        <div class="calendar-stat">
          <span class="stat-value">${activeDays > 0 ? (monthTotal / activeDays).toFixed(1) : '0'}</span>
          <span class="stat-label">km / 日平均</span>
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    this.attachEvents();
  },
  
  /**
   * イベントリスナーを設定
   */
  attachEvents() {
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevMonth());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextMonth());
    }
    
    // 日付クリックでその日の記録を表示
    this.container.querySelectorAll('.calendar-day:not(.empty):not(.future)').forEach(day => {
      day.addEventListener('click', (e) => {
        const date = e.currentTarget.dataset.date;
        this.showDayDetail(date);
      });
    });
  },
  
  /**
   * 前月へ移動
   */
  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.render();
  },
  
  /**
   * 次月へ移動
   */
  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.render();
  },
  
  /**
   * 今月に戻る
   */
  goToToday() {
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();
    this.render();
  },
  
  /**
   * その日の詳細を表示
   */
  showDayDetail(dateStr) {
    const dayRecords = this.records.filter(r => r.date === dateStr);
    
    if (dayRecords.length === 0) {
      // 記録がない場合、記録フォームの日付を設定
      const dateInput = document.getElementById('record-date');
      if (dateInput) {
        dateInput.value = dateStr;
        dateInput.focus();
      }
      return;
    }
    
    // 記録がある場合、詳細を表示
    const date = new Date(dateStr);
    const formatted = `${date.getMonth() + 1}月${date.getDate()}日`;
    const totalDistance = dayRecords.reduce((sum, r) => sum + r.distance, 0);
    
    const details = dayRecords.map(r => 
      `${r.type === 'run' ? '🏃' : '🚶'} ${r.distance.toFixed(1)}km${r.memo ? ` - ${r.memo}` : ''}`
    ).join('\n');
    
    if (typeof App !== 'undefined' && App.showToast) {
      App.showToast(`📅 ${formatted}: ${totalDistance.toFixed(1)}km\n${details}`, 'info', 4000);
    }
  },
  
  /**
   * 記録を更新
   */
  updateRecords(records) {
    this.records = records;
    this.render();
  },
  
  /**
   * 年間ヒートマップを描画（GitHub草スタイル）
   */
  renderYearHeatmap(containerId, records) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // 日付ごとの距離を集計
    const dateMap = {};
    records.forEach(r => {
      if (!dateMap[r.date]) dateMap[r.date] = 0;
      dateMap[r.date] += r.distance;
    });
    
    let html = '<div class="heatmap-container"><div class="heatmap-grid">';
    
    // 週ごとにグループ化
    const currentDate = new Date(oneYearAgo);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // 週の始まりに調整
    
    while (currentDate <= today) {
      const weekHtml = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const distance = dateMap[dateStr] || 0;
        
        let levelClass = 'level-0';
        if (distance > 0) {
          if (distance >= 20) levelClass = 'level-4';
          else if (distance >= 10) levelClass = 'level-3';
          else if (distance >= 5) levelClass = 'level-2';
          else levelClass = 'level-1';
        }
        
        const inRange = currentDate >= oneYearAgo && currentDate <= today;
        weekHtml.push(`
          <div class="heatmap-day ${inRange ? levelClass : 'out-of-range'}" 
               title="${dateStr}: ${distance.toFixed(1)}km"></div>
        `);
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      html += `<div class="heatmap-week">${weekHtml.join('')}</div>`;
    }
    
    html += '</div></div>';
    
    // 年間統計
    const yearRecords = records.filter(r => new Date(r.date) >= oneYearAgo);
    const yearTotal = yearRecords.reduce((sum, r) => sum + r.distance, 0);
    const activeDays = new Set(yearRecords.map(r => r.date)).size;
    
    html += `
      <div class="heatmap-stats">
        <span>📅 過去1年: ${yearTotal.toFixed(1)}km / ${activeDays}日</span>
      </div>
    `;
    
    container.innerHTML = html;
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Calendar;
}
