/**
 * グラフ・統計表示機能
 * Chart.js を使用したデータビジュアライゼーション
 */

const Charts = {
  chartInstances: {},
  
  /**
   * グラフを初期化
   */
  init() {
    // Chart.jsのデフォルト設定
    if (typeof Chart !== 'undefined') {
      Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      Chart.defaults.plugins.legend.display = false;
    }
  },
  
  /**
   * 週別距離グラフを描画
   * @param {string} canvasId - キャンバス要素のID
   * @param {array} records - 記録データの配列
   */
  renderWeeklyChart(canvasId, records) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    // 過去7日間のデータを集計
    const weekData = this.getWeeklyData(records);
    
    // 既存のチャートを破棄
    if (this.chartInstances[canvasId]) {
      this.chartInstances[canvasId].destroy();
    }
    
    const ctx = canvas.getContext('2d');
    const isDark = document.body.classList.contains('dark-mode');
    
    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weekData.labels,
        datasets: [{
          label: '距離 (km)',
          data: weekData.distances,
          backgroundColor: weekData.distances.map((_, i) => {
            return i === 6 ? 'rgba(255, 107, 107, 0.8)' : 'rgba(78, 205, 196, 0.6)';
          }),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            },
            ticks: {
              color: isDark ? '#aaa' : '#666'
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: isDark ? '#aaa' : '#666'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y.toFixed(1)} km`
            }
          }
        }
      }
    });
  },
  
  /**
   * 月別距離グラフを描画
   * @param {string} canvasId - キャンバス要素のID
   * @param {array} records - 記録データの配列
   */
  renderMonthlyChart(canvasId, records) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const monthData = this.getMonthlyData(records);
    
    if (this.chartInstances[canvasId]) {
      this.chartInstances[canvasId].destroy();
    }
    
    const ctx = canvas.getContext('2d');
    const isDark = document.body.classList.contains('dark-mode');
    
    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthData.labels,
        datasets: [{
          label: '距離 (km)',
          data: monthData.distances,
          borderColor: 'rgba(255, 107, 107, 1)',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: 'rgba(255, 107, 107, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            },
            ticks: {
              color: isDark ? '#aaa' : '#666'
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: isDark ? '#aaa' : '#666'
            }
          }
        }
      }
    });
  },
  
  /**
   * 種別割合ドーナツグラフを描画
   * @param {string} canvasId - キャンバス要素のID
   * @param {object} stats - 統計データ
   */
  renderTypeChart(canvasId, stats) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    if (this.chartInstances[canvasId]) {
      this.chartInstances[canvasId].destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['🏃 ランニング', '🚶 ウォーキング'],
        datasets: [{
          data: [stats.totalRunDistance || 0, stats.totalWalkDistance || 0],
          backgroundColor: ['rgba(255, 107, 107, 0.8)', 'rgba(78, 205, 196, 0.8)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed.toFixed(1)} km`
            }
          }
        }
      }
    });
  },
  
  /**
   * 累計距離推移グラフを描画
   * @param {string} canvasId - キャンバス要素のID
   * @param {array} records - 記録データの配列
   */
  renderCumulativeChart(canvasId, records) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const cumulativeData = this.getCumulativeData(records);
    
    if (this.chartInstances[canvasId]) {
      this.chartInstances[canvasId].destroy();
    }
    
    const ctx = canvas.getContext('2d');
    const isDark = document.body.classList.contains('dark-mode');
    
    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: cumulativeData.labels,
        datasets: [{
          label: '累計距離 (km)',
          data: cumulativeData.distances,
          borderColor: 'rgba(107, 203, 119, 1)',
          backgroundColor: 'rgba(107, 203, 119, 0.1)',
          fill: true,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            },
            ticks: {
              color: isDark ? '#aaa' : '#666'
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: isDark ? '#aaa' : '#666',
              maxTicksLimit: 10
            }
          }
        }
      }
    });
  },
  
  /**
   * 曜日別平均グラフを描画
   */
  renderDayOfWeekChart(canvasId, records) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    
    const dayData = this.getDayOfWeekData(records);
    
    if (this.chartInstances[canvasId]) {
      this.chartInstances[canvasId].destroy();
    }
    
    const ctx = canvas.getContext('2d');
    const isDark = document.body.classList.contains('dark-mode');
    
    this.chartInstances[canvasId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['日', '月', '火', '水', '木', '金', '土'],
        datasets: [{
          label: '平均距離 (km)',
          data: dayData,
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          borderColor: 'rgba(255, 107, 107, 1)',
          pointBackgroundColor: 'rgba(255, 107, 107, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255, 107, 107, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            },
            pointLabels: {
              color: isDark ? '#aaa' : '#666'
            },
            ticks: {
              color: isDark ? '#aaa' : '#666',
              backdropColor: 'transparent'
            }
          }
        }
      }
    });
  },
  
  /**
   * 過去7日間のデータを集計
   */
  getWeeklyData(records) {
    const labels = [];
    const distances = [];
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      labels.push(dayName);
      
      const dayRecords = records.filter(r => r.date === dateStr);
      const totalDistance = dayRecords.reduce((sum, r) => sum + r.distance, 0);
      distances.push(totalDistance);
    }
    
    return { labels, distances };
  },
  
  /**
   * 過去6ヶ月のデータを集計
   */
  getMonthlyData(records) {
    const labels = [];
    const distances = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      labels.push(`${month + 1}月`);
      
      const monthRecords = records.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate.getFullYear() === year && recordDate.getMonth() === month;
      });
      
      const totalDistance = monthRecords.reduce((sum, r) => sum + r.distance, 0);
      distances.push(totalDistance);
    }
    
    return { labels, distances };
  },
  
  /**
   * 累計距離の推移データを取得
   */
  getCumulativeData(records) {
    const sortedRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = [];
    const distances = [];
    let cumulative = 0;
    
    sortedRecords.forEach(record => {
      cumulative += record.distance;
      const date = new Date(record.date);
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
      distances.push(cumulative);
    });
    
    return { labels, distances };
  },
  
  /**
   * 曜日別平均データを取得
   */
  getDayOfWeekData(records) {
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    records.forEach(record => {
      const day = new Date(record.date).getDay();
      dayTotals[day] += record.distance;
      dayCounts[day]++;
    });
    
    return dayTotals.map((total, i) => dayCounts[i] > 0 ? total / dayCounts[i] : 0);
  },
  
  /**
   * 全てのチャートを更新
   */
  updateAllCharts(records, stats) {
    this.renderWeeklyChart('weekly-chart', records);
    this.renderMonthlyChart('monthly-chart', records);
    this.renderTypeChart('type-chart', stats);
    this.renderCumulativeChart('cumulative-chart', records);
    this.renderDayOfWeekChart('dayofweek-chart', records);
  },
  
  /**
   * チャートを破棄
   */
  destroyAllCharts() {
    Object.values(this.chartInstances).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.chartInstances = {};
  }
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Charts;
}
