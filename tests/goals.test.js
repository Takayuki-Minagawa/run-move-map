const Goals = require('../js/goals');

describe('Goals challenge rendering regression', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="goals"></div><div id="challenges"></div>';
    global.Storage = {
      load: jest.fn(() => ({})),
      getStatistics: jest.fn(() => ({ streak: { current: 0 } })),
      getActiveChallenge: jest.fn(() => null),
      saveActiveChallenge: jest.fn()
    };
  });

  afterEach(() => {
    delete global.Storage;
  });

  test('initは実装済みのチャレンジ選択UIを描画する', () => {
    expect(() => Goals.init('goals', 'challenges', [])).not.toThrow();
    expect(document.querySelectorAll('.challenge-option')).toHaveLength(7);
  });

  test('旧形式のidを持つアクティブチャレンジも進捗計算できる', () => {
    const progress = Goals.calculateChallengeProgress({
      id: 'weekly_50',
      startDate: new Date().toISOString().slice(0, 10)
    }, [{ date: new Date().toISOString().slice(0, 10), distance: 10 }]);
    expect(progress.challenge.id).toBe('weekly_50');
    expect(progress.current).toBe(10);
  });
});
