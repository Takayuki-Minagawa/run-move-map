const SeasonFx = require('../js/season-fx');
const ShareCard = require('../js/share-card');
const SoundEffects = require('../js/sound-effects');

describe('SeasonFx', () => {
  test.each([
    [4, 'spring'], [7, 'summer'], [10, 'autumn'], [1, 'winter']
  ])('%i月の季節は%s', (month, season) => {
    expect(SeasonFx.getSeason(month)).toBe(season);
  });

  test('既定値を保存せず設定を読み、要素数を制限して描画する', () => {
    document.body.innerHTML = '<input type="checkbox" id="season-fx-toggle"><div id="season-fx"></div><span id="season-fx-badge" class="season-fx-badge"><span id="season-fx-label"></span></span>';
    const storage = { getSettings: jest.fn(() => ({})), saveSettings: jest.fn() };
    SeasonFx.bound = false;
    SeasonFx.init({ records: [{ date: '2026-04-01' }] }, storage);
    expect(storage.saveSettings).not.toHaveBeenCalled();
    expect(document.querySelectorAll('.season-particle').length).toBeLessThanOrEqual(18);
    expect(document.getElementById('season-fx-label').textContent).toBe('春・桜');
  });

  test('配列末尾ではなく日付順で最新の記録月を使う', () => {
    document.body.innerHTML = '<div id="season-fx"></div><span id="season-fx-label"></span>';
    SeasonFx.update({ records: [
      { date: '2026-07-01' },
      { date: '2025-01-01' }
    ] });
    expect(SeasonFx.currentDate).toBe('2026-07-01');
    expect(document.getElementById('season-fx-label').textContent).toBe('夏・波');
  });

  test('設定をOFFにすると演出と季節バッジを非表示にする', () => {
    document.body.innerHTML = '<input type="checkbox" id="season-fx-toggle"><div id="season-fx"></div><span id="season-fx-badge" class="season-fx-badge"><span id="season-fx-label"></span></span>';
    const storage = { getSettings: jest.fn(() => ({ seasonFx: false })), saveSettings: jest.fn() };
    SeasonFx.bound = false;
    SeasonFx.init({ records: [{ date: '2026-04-01' }] }, storage);
    expect(document.getElementById('season-fx').hidden).toBe(true);
    expect(document.getElementById('season-fx-badge').hidden).toBe(true);
  });
});

describe('ShareCard', () => {
  test('共有カード用の派生サマリーを作る', () => {
    const summary = ShareCard.buildSummary({
      totalDistance: 75,
      streakDays: 3,
      records: [{}, {}]
    }, {
      totalDistance: 100,
      cities: [{ name: '開始', cumulative: 0 }, { name: '中間', cumulative: 50 }, { name: '終了', cumulative: 100 }]
    }, { current: { name: '旅人', icon: '🧭' } });
    expect(summary).toMatchObject({ progress: 75, currentCity: '中間', nextCity: '終了', recordCount: 2 });
  });
});

describe('SoundEffects', () => {
  test('無効時はAudioContextを作らず再生しない', () => {
    SoundEffects.enabled = false;
    SoundEffects.context = null;
    expect(SoundEffects.playRecord()).toBe(false);
    expect(SoundEffects.context).toBeNull();
  });

  test('都市とゴールのメロディは記録音より長い', () => {
    expect(SoundEffects.melodies.city.length).toBeGreaterThan(SoundEffects.melodies.record.length);
    expect(SoundEffects.melodies.goal.length).toBeGreaterThan(SoundEffects.melodies.city.length);
  });
});
