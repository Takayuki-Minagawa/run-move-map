const fs = require('fs');
const path = require('path');
const Storage = require('../js/storage');

function readAsV203(json) {
  const data = JSON.parse(json);
  if (typeof data.totalDistance !== 'number' || !Array.isArray(data.records)) {
    throw new Error('Invalid v2.0.3 backup');
  }
  return data;
}

describe('v2.0.3 backup compatibility', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'v2.0.3-backup.json');

  test('旧バックアップを読み込み、再エクスポートしたJSONを旧形式で読める', () => {
    const json = fs.readFileSync(fixturePath, 'utf8');
    const original = readAsV203(json);
    expect(Storage.importData(json)).toBe(true);

    const loaded = Storage.load();
    expect(loaded.totalDistance).toBe(12.5);
    expect(loaded.records[0].memo).toBe('v2.0.3 backup');

    const reExported = readAsV203(Storage.exportData());
    expect(Object.keys(reExported).sort()).toEqual(Object.keys(original).sort());
    expect(reExported.records).toEqual(original.records);
    expect(reExported.stats).toEqual(original.stats);
  });

  test('settingsへ新機能設定を追加しても旧版の必須フィールドは同じ型を保つ', () => {
    const json = fs.readFileSync(fixturePath, 'utf8');
    Storage.importData(json);
    Storage.saveSettings({ seasonFx: false, sound: true, ghost: { enabled: true, dailyPace: 5 } });
    const legacy = readAsV203(Storage.exportData());
    expect(typeof legacy.totalDistance).toBe('number');
    expect(Array.isArray(legacy.records)).toBe(true);
    expect(legacy.settings.ghost.dailyPace).toBe(5);
  });
});
