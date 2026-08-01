const Postcards = require('../js/postcards');

const cities = [
  { id: 'start', name: '開始', cumulative: 0, trivia: '出発', landmark: '駅' },
  { id: 'middle', name: '中間', cumulative: 650, trivia: '途中', landmark: '塔' },
  { id: 'goal', name: 'ゴール', cumulative: 800, trivia: '到着', landmark: '城' }
];

describe('Postcards', () => {
  test('記録を日付順に積算して都市到達日を逆算する', () => {
    const dates = Postcards.calculateReachDates([
      { id: 2, date: '2026-01-02', distance: 100 },
      { id: 1, date: '2026-01-01', distance: 600 },
      { id: 3, date: '2026-01-03', distance: 100 }
    ], cities);
    expect(dates).toEqual({
      start: '2026-01-01',
      middle: '2026-01-02',
      goal: '2026-01-03'
    });
  });

  test('旧データでreachedCitiesが空でも累計距離から表示だけを復元する', () => {
    const unlocked = Postcards.getUnlockedCityIds({ totalDistance: 700, reachedCities: [] }, cities);
    expect([...unlocked]).toEqual(['start', 'middle']);
  });

  test('絵はがきと御朱印帳を描画する', () => {
    document.body.innerHTML = '<div id="postcard-gallery"></div><div id="stamp-book"></div>';
    Postcards.render({
      totalDistance: 700,
      reachedCities: ['middle'],
      records: [{ date: '2026-01-01', distance: 700 }]
    }, { cities });
    expect(document.querySelectorAll('.postcard')).toHaveLength(2);
    expect(document.querySelectorAll('.goshuin-page')).toHaveLength(3);
    expect(document.querySelectorAll('.goshuin-page.reached')).toHaveLength(2);
  });
});
