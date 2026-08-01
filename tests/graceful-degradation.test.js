const fs = require('fs');
const path = require('path');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

const appSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const htmlSource = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const optionalModules = {
  FunStats: { render: jest.fn() },
  Postcards: { render: jest.fn() },
  JourneyReplay: { init: jest.fn(), update: jest.fn() },
  ShareCard: { init: jest.fn(), update: jest.fn(), draw: jest.fn() },
  SeasonFx: { init: jest.fn(), update: jest.fn() },
  SoundEffects: { init: jest.fn(), playRecord: jest.fn(), playCity: jest.fn(), playGoal: jest.fn() },
  FunExtras: { init: jest.fn(), update: jest.fn(), getCelebrationTheme: jest.fn(() => ({ colors: ['#fff'], shapes: ['◆'] })) }
};

function createWindowWithout(omittedName) {
  const dom = new JSDOM(htmlSource, {
    runScripts: 'outside-only',
    url: 'http://localhost/'
  });
  const { window } = dom;
  const data = {
    totalDistance: 0,
    records: [],
    reachedCities: [],
    earnedBadges: [],
    streakDays: 0,
    stats: { totalRecords: 0, totalRunDistance: 0, totalWalkDistance: 0, longestStreak: 0 }
  };
  window.Storage = {
    load: () => data,
    getStatistics: () => ({
      weekly: { distance: 0, count: 0 },
      monthly: { distance: 0, count: 0 },
      total: { distance: 0, count: 0, runDistance: 0, walkDistance: 0 },
      streak: { current: 0, longest: 0 }
    }),
    getSettings: () => ({})
  };
  window.ROUTE_DATA = {
    totalDistance: 3000,
    cities: [
      { id: 'okinawa', name: '那覇', cumulative: 0 },
      { id: 'sapporo', name: '札幌', cumulative: 3000 }
    ]
  };
  window.getLocationByDistance = () => ({
    currentCity: { name: '那覇' },
    nextCity: { name: '札幌' },
    distanceToNext: 3000,
    progress: 0,
    segmentProgress: 0
  });
  window.JapanMap = {
    init: () => Promise.resolve(),
    update: jest.fn(),
    getPositionOnRoute: () => ({ x: 0, y: 0 })
  };
  window.Achievements = {
    getAllBadges: () => [],
    getCurrentLevel: () => ({ current: { name: '初心者', icon: '🐣' }, next: null, progress: 0 })
  };
  Object.entries(optionalModules).forEach(([name, module]) => {
    if (name !== omittedName) window[name] = module;
  });
  window.console.log = jest.fn();
  window.console.warn = jest.fn();
  window.console.error = jest.fn();
  window.eval(appSource);
  return { dom, window };
}

describe.each(Object.keys(optionalModules))('%sを無効化した場合', omittedName => {
  test('アプリ本体は起動を継続する', async () => {
    const { dom, window } = createWindowWithout(omittedName);
    if (window.document.readyState === 'loading') {
      await new Promise(resolve => window.document.addEventListener('DOMContentLoaded', resolve, { once: true }));
    }
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(window.console.error).not.toHaveBeenCalled();
    expect(window.JapanMap.update).toHaveBeenCalled();
    expect(window.document.getElementById('total-distance').textContent).toBe('0.0');
    dom.window.close();
  });
});
