const FunExtras = require('../js/fun-extras');

describe('FunExtras', () => {
  test('全都市のクイズに有効な3択と分散した正解位置がある', () => {
    const quizzes = Object.values(FunExtras.quizData);
    expect(quizzes).toHaveLength(14);
    quizzes.forEach(quiz => {
      expect(quiz.options).toHaveLength(3);
      expect(quiz.answer).toBeGreaterThanOrEqual(0);
      expect(quiz.answer).toBeLessThan(3);
    });
    expect(new Set(quizzes.map(quiz => quiz.answer)).size).toBe(3);
  });

  test('ゴーストは開始日と日次ペースから現在距離を計算する', () => {
    const progress = FunExtras.calculateGhostProgress({
      enabled: true,
      startDate: '2026-07-22',
      dailyPace: 5
    }, '2026-08-01', 3000);
    expect(progress.daysElapsed).toBe(10);
    expect(progress.distance).toBe(50);
  });

  test('無効なゴーストと未来開始日は0kmになる', () => {
    expect(FunExtras.calculateGhostProgress({ enabled: false }, '2026-08-01').distance).toBe(0);
    expect(FunExtras.calculateGhostProgress({ enabled: true, startDate: '2026-08-02', dailyPace: 5 }, '2026-08-01').distance).toBe(0);
  });

  test('年間振り返りの総距離・最長日・最多月・種別を集計する', () => {
    const summary = FunExtras.calculateYearSummary([
      { date: '2026-01-01', distance: 3, type: 'run' },
      { date: '2026-01-01', distance: 2, type: 'walk' },
      { date: '2026-02-01', distance: 4, type: 'run' },
      { date: '2025-12-31', distance: 99, type: 'run' }
    ], 2026, ['badge-a']);
    expect(summary.totalDistance).toBe(9);
    expect(summary.activeDays).toBe(2);
    expect(summary.longestDay).toEqual({ date: '2026-01-01', distance: 5 });
    expect(summary.bestMonth).toEqual({ month: 1, distance: 5 });
    expect(summary.runDistance).toBe(7);
    expect(summary.walkDistance).toBe(2);
    expect(summary.badgeCount).toBe(1);
  });

  test('都市ごとの紙吹雪テーマと既定テーマを返す', () => {
    expect(FunExtras.getCelebrationTheme('sapporo').shapes).toContain('❄');
    expect(FunExtras.getCelebrationTheme('unknown')).toBe(FunExtras.celebrationThemes.default);
  });

  test('累計距離から解放済みクイズ都市を派生する', () => {
    FunExtras.data = { totalDistance: 700, reachedCities: [] };
    FunExtras.route = { cities: [
      { id: 'okinawa', cumulative: 0 },
      { id: 'kagoshima', cumulative: 650 },
      { id: 'kumamoto', cumulative: 800 }
    ] };
    expect(FunExtras.getReachedQuizCities().map(city => city.id)).toEqual(['okinawa', 'kagoshima']);
  });
});
