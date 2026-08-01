const JourneyReplay = require('../js/replay');

describe('JourneyReplay', () => {
  test('同日の記録をまとめた時系列フレームを作る', () => {
    const timeline = JourneyReplay.buildTimeline([
      { id: 2, date: '2026-01-01', distance: 2 },
      { id: 1, date: '2026-01-01', distance: 3 },
      { id: 3, date: '2026-02-01', distance: 4 }
    ], 9, 3000);
    expect(timeline).toHaveLength(3);
    expect(timeline[1]).toMatchObject({ date: '2026-01-01', distance: 5, addedDistance: 5 });
    expect(timeline[2].distance).toBe(9);
  });

  test('旧データの累計値とrecords合計がずれる場合は現在地フレームを補う', () => {
    const timeline = JourneyReplay.buildTimeline([{ date: '2026-01-01', distance: 5 }], 10, 3000);
    expect(timeline.at(-1)).toMatchObject({ distance: 10, label: '現在地' });
  });

  test('ルート総距離を超えるフレームをクランプする', () => {
    const timeline = JourneyReplay.buildTimeline([{ date: '2026-01-01', distance: 120 }], 120, 100);
    expect(timeline.at(-1).distance).toBe(100);
  });
});
