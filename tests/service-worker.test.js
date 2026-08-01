const fs = require('fs');
const path = require('path');

describe('Service Worker precache', () => {
  const root = path.join(__dirname, '..');
  const source = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

  test('キャッシュバージョンがv2.1.0である', () => {
    expect(source).toContain("const CACHE_VERSION = 'v2.1.0'");
  });

  test('プリキャッシュ対象のローカルファイルがすべて存在する', () => {
    const arrayMatch = source.match(/const ASSETS_TO_CACHE = \[([\s\S]*?)\];/);
    expect(arrayMatch).not.toBeNull();
    const assets = [...arrayMatch[1].matchAll(/'\.\/(.*?)'/g)]
      .map(match => match[1])
      .filter(Boolean);
    expect(assets.length).toBeGreaterThan(10);
    assets.forEach(asset => {
      expect(fs.existsSync(path.join(root, asset))).toBe(true);
    });
  });

  test('v2.1の全JS/CSSをプリキャッシュする', () => {
    [
      'css/fun.css',
      'js/fun-stats.js',
      'js/postcards.js',
      'js/replay.js',
      'js/share-card.js',
      'js/season-fx.js',
      'js/sound-effects.js',
      'js/fun-extras.js'
    ].forEach(asset => expect(source).toContain(`'./${asset}'`));
  });
});
