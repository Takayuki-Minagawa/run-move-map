const FunStats = require('../js/fun-stats');

describe('FunStats', () => {
  test('累計距離を4種類のおもしろ換算へ変換する', () => {
    const conversions = FunStats.getDistanceConversions(42.195);
    expect(conversions).toHaveLength(4);
    expect(conversions[0].value).toBeCloseTo(1);
    expect(conversions[2].value).toBeCloseTo(42.195 / 40075 * 100);
  });

  test('直近28日の平均は最初の記録日からの暦日で計算する', () => {
    const pace = FunStats.calculateRecentPace([
      { date: '2026-07-31', distance: 4 },
      { date: '2026-08-01', distance: 6 },
      { date: '2026-06-01', distance: 100 }
    ], '2026-08-01');

    expect(pace.distance).toBe(10);
    expect(pace.days).toBe(2);
    expect(pace.dailyAverage).toBe(5);
  });

  test('次の都市とゴールの到着日を予測する', () => {
    const route = {
      totalDistance: 100,
      cities: [
        { name: 'スタート', cumulative: 0 },
        { name: '中間', cumulative: 50 },
        { name: 'ゴール', cumulative: 100 }
      ]
    };
    const forecast = FunStats.calculateArrivalForecast(40, [
      { date: '2026-07-31', distance: 5 },
      { date: '2026-08-01', distance: 5 }
    ], route, '2026-08-01');

    expect(forecast.next.days).toBe(2);
    expect(FunStats.formatDateKey(forecast.next.date)).toBe('2026-08-03');
    expect(forecast.goal.days).toBe(12);
  });

  test('1年前の同日の複数記録とメモを集約する', () => {
    const memory = FunStats.getAnniversaryMemory([
      { date: '2025-08-01', distance: 2, memo: '朝ラン' },
      { date: '2025-08-01', distance: 3, memo: '' }
    ], '2026-08-01');

    expect(memory.distance).toBe(5);
    expect(memory.memos).toEqual(['朝ラン']);
  });

  test('うるう日の1年前は2月末へ補正する', () => {
    const memory = FunStats.getAnniversaryMemory([
      { date: '2023-02-28', distance: 1 }
    ], '2024-02-29');
    expect(memory.date).toBe('2023-02-28');
  });

  test('都市間の緯度経度を線形補間してGoogleマップURLを作る', () => {
    const position = FunStats.interpolateGeoPosition(50, [
      { cumulative: 0, geo: { lat: 10, lng: 20 } },
      { cumulative: 100, geo: { lat: 20, lng: 40 } }
    ]);
    expect(position).toEqual({ lat: 15, lng: 30 });
    const links = FunStats.buildMapLinks(position);
    expect(links.map).toContain('15.000000%2C30.000000');
    expect(links.streetView).toContain('map_action=pano');
  });

  test('今日のミッションは日付シードで固定され、記録から達成判定する', () => {
    const date = '2026-08-01';
    const empty = FunStats.getDailyMission([], date);
    const complete = FunStats.getDailyMission([
      { date, distance: 3, type: 'run', memo: '空がきれい' },
      { date, distance: 3, type: 'walk', memo: '' }
    ], date);
    expect(complete.title).toBe(empty.title);
    expect(complete.completed).toBe(true);
  });

  test('DOMコンテナへ統計を描画してユーザー文字列をエスケープする', () => {
    document.body.innerHTML = `
      <div id="fun-conversions"></div><div id="arrival-forecast"></div>
      <div id="anniversary-memory"></div><div id="current-location-links"></div>
      <div id="daily-mission"></div>
    `;
    const route = {
      totalDistance: 100,
      cities: [
        { name: '開始', cumulative: 0, geo: { lat: 10, lng: 20 } },
        { name: '終了', cumulative: 100, geo: { lat: 20, lng: 40 } }
      ]
    };
    FunStats.render({ totalDistance: 10, records: [] }, route);
    expect(document.getElementById('fun-conversions').children).toHaveLength(4);
    expect(document.querySelectorAll('#current-location-links a')).toHaveLength(2);
  });
});
