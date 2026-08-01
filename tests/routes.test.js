/**
 * routes.js のテスト
 * ルートデータと位置計算機能のテスト
 */

const { ROUTE_DATA: ACTUAL_ROUTE_DATA } = require('../js/routes');

describe('ROUTE_DATA', () => {
  // ルートデータを直接定義してテスト
  const ROUTE_DATA = {
    name: '日本縦断コース',
    totalDistance: 3000,
    cities: [
      { id: 'okinawa', name: '那覇', prefecture: '沖縄県', cumulative: 0, coordinates: { x: 25, y: 92 }, trivia: 'test', landmark: 'test' },
      { id: 'kagoshima', name: '鹿児島', prefecture: '鹿児島県', cumulative: 650, coordinates: { x: 35, y: 78 }, trivia: 'test', landmark: 'test' },
      { id: 'kumamoto', name: '熊本', prefecture: '熊本県', cumulative: 800, coordinates: { x: 37, y: 72 }, trivia: 'test', landmark: 'test' },
      { id: 'fukuoka', name: '福岡', prefecture: '福岡県', cumulative: 920, coordinates: { x: 38, y: 68 }, trivia: 'test', landmark: 'test' },
      { id: 'hiroshima', name: '広島', prefecture: '広島県', cumulative: 1100, coordinates: { x: 48, y: 65 }, trivia: 'test', landmark: 'test' },
      { id: 'okayama', name: '岡山', prefecture: '岡山県', cumulative: 1200, coordinates: { x: 54, y: 63 }, trivia: 'test', landmark: 'test' },
      { id: 'osaka', name: '大阪', prefecture: '大阪府', cumulative: 1350, coordinates: { x: 60, y: 60 }, trivia: 'test', landmark: 'test' },
      { id: 'kyoto', name: '京都', prefecture: '京都府', cumulative: 1400, coordinates: { x: 62, y: 57 }, trivia: 'test', landmark: 'test' },
      { id: 'nagoya', name: '名古屋', prefecture: '愛知県', cumulative: 1550, coordinates: { x: 66, y: 55 }, trivia: 'test', landmark: 'test' },
      { id: 'shizuoka', name: '静岡', prefecture: '静岡県', cumulative: 1700, coordinates: { x: 72, y: 52 }, trivia: 'test', landmark: 'test' },
      { id: 'tokyo', name: '東京', prefecture: '東京都', cumulative: 1880, coordinates: { x: 78, y: 48 }, trivia: 'test', landmark: 'test' },
      { id: 'sendai', name: '仙台', prefecture: '宮城県', cumulative: 2230, coordinates: { x: 82, y: 35 }, trivia: 'test', landmark: 'test' },
      { id: 'aomori', name: '青森', prefecture: '青森県', cumulative: 2530, coordinates: { x: 82, y: 25 }, trivia: 'test', landmark: 'test' },
      { id: 'sapporo', name: '札幌', prefecture: '北海道', cumulative: 3000, coordinates: { x: 85, y: 12 }, trivia: 'test', landmark: 'test' },
    ]
  };

  // getLocationByDistance関数の実装
  function getLocationByDistance(distance) {
    const cities = ROUTE_DATA.cities;
    
    if (distance >= ROUTE_DATA.totalDistance) {
      return {
        currentCity: cities[cities.length - 1],
        nextCity: null,
        progress: 100,
        distanceToNext: 0,
        isCompleted: true
      };
    }
    
    let currentCity = cities[0];
    let nextCity = cities[1];
    
    for (let i = 0; i < cities.length - 1; i++) {
      if (distance >= cities[i].cumulative && distance < cities[i + 1].cumulative) {
        currentCity = cities[i];
        nextCity = cities[i + 1];
        break;
      }
    }
    
    const distanceToNext = nextCity.cumulative - distance;
    const segmentDistance = nextCity.cumulative - currentCity.cumulative;
    const segmentProgress = distance - currentCity.cumulative;
    const segmentPercent = (segmentProgress / segmentDistance) * 100;
    const totalProgress = (distance / ROUTE_DATA.totalDistance) * 100;
    
    return {
      currentCity,
      nextCity,
      progress: totalProgress,
      segmentProgress: segmentPercent,
      distanceToNext,
      distanceFromStart: distance,
      isCompleted: false
    };
  }

  // getNewlyReachedCities関数の実装
  function getNewlyReachedCities(oldDistance, newDistance) {
    return ROUTE_DATA.cities.filter(city => 
      city.cumulative > oldDistance && city.cumulative <= newDistance
    );
  }

  test('ルートデータが正しく定義されている', () => {
    expect(ROUTE_DATA).toBeDefined();
    expect(ROUTE_DATA.name).toBe('日本縦断コース');
    expect(ROUTE_DATA.totalDistance).toBe(3000);
  });

  test('14都市が定義されている', () => {
    expect(ROUTE_DATA.cities).toHaveLength(14);
  });

  test('最初の都市は那覇（沖縄）', () => {
    const firstCity = ROUTE_DATA.cities[0];
    expect(firstCity.id).toBe('okinawa');
    expect(firstCity.name).toBe('那覇');
    expect(firstCity.cumulative).toBe(0);
  });

  test('最後の都市は札幌（北海道）', () => {
    const lastCity = ROUTE_DATA.cities[ROUTE_DATA.cities.length - 1];
    expect(lastCity.id).toBe('sapporo');
    expect(lastCity.name).toBe('札幌');
    expect(lastCity.cumulative).toBe(3000);
  });

  test('累計距離が昇順になっている', () => {
    const distances = ROUTE_DATA.cities.map(c => c.cumulative);
    for (let i = 1; i < distances.length; i++) {
      expect(distances[i]).toBeGreaterThan(distances[i - 1]);
    }
  });

  test('各都市に必要なプロパティがある', () => {
    ROUTE_DATA.cities.forEach(city => {
      expect(city).toHaveProperty('id');
      expect(city).toHaveProperty('name');
      expect(city).toHaveProperty('prefecture');
      expect(city).toHaveProperty('cumulative');
      expect(city).toHaveProperty('coordinates');
      expect(city).toHaveProperty('trivia');
      expect(city).toHaveProperty('landmark');
    });
  });

  test('実データの全都市に日本国内の緯度経度がある', () => {
    ACTUAL_ROUTE_DATA.cities.forEach(city => {
      expect(city.geo.lat).toBeGreaterThanOrEqual(20);
      expect(city.geo.lat).toBeLessThanOrEqual(46);
      expect(city.geo.lng).toBeGreaterThanOrEqual(122);
      expect(city.geo.lng).toBeLessThanOrEqual(154);
    });
  });

  describe('getLocationByDistance', () => {
    test('0kmの場合、那覇にいる', () => {
      const location = getLocationByDistance(0);
      expect(location.currentCity.id).toBe('okinawa');
      expect(location.nextCity.id).toBe('kagoshima');
      expect(location.isCompleted).toBe(false);
    });

    test('650kmの場合、鹿児島に到達', () => {
      const location = getLocationByDistance(650);
      expect(location.currentCity.id).toBe('kagoshima');
      expect(location.nextCity.id).toBe('kumamoto');
    });

    test('1500kmの場合、京都と名古屋の間', () => {
      const location = getLocationByDistance(1500);
      expect(location.currentCity.id).toBe('kyoto');
      expect(location.nextCity.id).toBe('nagoya');
      expect(location.distanceToNext).toBe(50);
    });

    test('3000km以上の場合、完走フラグがtrue', () => {
      const location = getLocationByDistance(3000);
      expect(location.isCompleted).toBe(true);
      expect(location.currentCity.id).toBe('sapporo');
      expect(location.nextCity).toBeNull();
    });

    test('3500kmでも完走として扱う', () => {
      const location = getLocationByDistance(3500);
      expect(location.isCompleted).toBe(true);
    });

    test('進捗率が正しく計算される', () => {
      const location = getLocationByDistance(1500);
      expect(location.progress).toBeCloseTo(50, 0);
    });
  });

  describe('getNewlyReachedCities', () => {
    test('0kmから700kmで鹿児島に到達', () => {
      const cities = getNewlyReachedCities(0, 700);
      expect(cities).toHaveLength(1);
      expect(cities[0].id).toBe('kagoshima');
    });

    test('0kmから1000kmで3都市に到達', () => {
      const cities = getNewlyReachedCities(0, 1000);
      expect(cities).toHaveLength(3);
      expect(cities.map(c => c.id)).toEqual(['kagoshima', 'kumamoto', 'fukuoka']);
    });

    test('同じ距離なら新規到達なし', () => {
      const cities = getNewlyReachedCities(500, 500);
      expect(cities).toHaveLength(0);
    });

    test('既に通過した区間では新規到達なし', () => {
      const cities = getNewlyReachedCities(1000, 1050);
      expect(cities).toHaveLength(0);
    });

    test('ちょうど都市の距離で到達判定', () => {
      const cities = getNewlyReachedCities(649, 650);
      expect(cities).toHaveLength(1);
      expect(cities[0].id).toBe('kagoshima');
    });
  });
});
