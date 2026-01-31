/**
 * 日本縦断ルートデータ
 * 沖縄から北海道までの主要都市と距離
 */

const ROUTE_DATA = {
  // ルート名
  name: "日本縦断コース",
  
  // 各都市データ（cumulative: 始点からの累計距離km）
  cities: [
    {
      id: "okinawa",
      name: "那覇",
      prefecture: "沖縄県",
      cumulative: 0,
      coordinates: { x: 25, y: 92 },
      trivia: "🌺 沖縄そばと美ら海水族館が有名！年間平均気温は23℃の常夏の島です。",
      landmark: "首里城"
    },
    {
      id: "kagoshima",
      name: "鹿児島",
      prefecture: "鹿児島県",
      cumulative: 650,
      coordinates: { x: 35, y: 78 },
      trivia: "🌋 桜島が見える絶景の街。黒豚やさつま揚げが美味しい！",
      landmark: "桜島"
    },
    {
      id: "kumamoto",
      name: "熊本",
      prefecture: "熊本県",
      cumulative: 800,
      coordinates: { x: 37, y: 72 },
      trivia: "🐻 くまモンの故郷！熊本城と馬刺しが名物です。",
      landmark: "熊本城"
    },
    {
      id: "fukuoka",
      name: "福岡",
      prefecture: "福岡県",
      cumulative: 920,
      coordinates: { x: 38, y: 68 },
      trivia: "🍜 とんこつラーメン発祥の地。屋台文化も有名です！",
      landmark: "太宰府天満宮"
    },
    {
      id: "hiroshima",
      name: "広島",
      prefecture: "広島県",
      cumulative: 1100,
      coordinates: { x: 48, y: 65 },
      trivia: "⛩️ 厳島神社と広島風お好み焼きが有名。平和記念公園も必見！",
      landmark: "厳島神社"
    },
    {
      id: "okayama",
      name: "岡山",
      prefecture: "岡山県",
      cumulative: 1200,
      coordinates: { x: 54, y: 63 },
      trivia: "🍑 桃太郎伝説の地。白桃とマスカットの産地です！",
      landmark: "倉敷美観地区"
    },
    {
      id: "osaka",
      name: "大阪",
      prefecture: "大阪府",
      cumulative: 1350,
      coordinates: { x: 60, y: 60 },
      trivia: "🐙 たこ焼き、お好み焼き、串カツ！食い倒れの街！",
      landmark: "大阪城"
    },
    {
      id: "kyoto",
      name: "京都",
      prefecture: "京都府",
      cumulative: 1400,
      coordinates: { x: 62, y: 57 },
      trivia: "⛩️ 千年の都。金閣寺、清水寺など歴史的建造物の宝庫！",
      landmark: "金閣寺"
    },
    {
      id: "nagoya",
      name: "名古屋",
      prefecture: "愛知県",
      cumulative: 1550,
      coordinates: { x: 66, y: 55 },
      trivia: "🍤 ひつまぶし、味噌カツ、手羽先！独自の食文化が魅力。",
      landmark: "名古屋城"
    },
    {
      id: "shizuoka",
      name: "静岡",
      prefecture: "静岡県",
      cumulative: 1700,
      coordinates: { x: 72, y: 52 },
      trivia: "🗻 富士山のお膝元！お茶とうなぎパイが有名です。",
      landmark: "富士山"
    },
    {
      id: "tokyo",
      name: "東京",
      prefecture: "東京都",
      cumulative: 1880,
      coordinates: { x: 78, y: 48 },
      trivia: "🗼 日本の首都！渋谷、浅草、秋葉原など見どころ満載！",
      landmark: "東京タワー"
    },
    {
      id: "sendai",
      name: "仙台",
      prefecture: "宮城県",
      cumulative: 2230,
      coordinates: { x: 82, y: 35 },
      trivia: "🌿 杜の都。牛タンとずんだ餅が名物です！",
      landmark: "瑞鳳殿"
    },
    {
      id: "aomori",
      name: "青森",
      prefecture: "青森県",
      cumulative: 2530,
      coordinates: { x: 82, y: 25 },
      trivia: "🍎 りんごの生産量日本一！ねぶた祭りも有名です。",
      landmark: "弘前城"
    },
    {
      id: "sapporo",
      name: "札幌",
      prefecture: "北海道",
      cumulative: 3000,
      coordinates: { x: 85, y: 12 },
      trivia: "🍺 ビールと味噌ラーメン、ジンギスカン！雪まつりも最高！",
      landmark: "時計台"
    }
  ],
  
  // 総距離
  totalDistance: 3000
};

/**
 * 現在の距離から位置情報を取得
 * @param {number} distance - 累計距離(km)
 * @returns {object} 現在地情報
 */
function getLocationByDistance(distance) {
  const cities = ROUTE_DATA.cities;
  
  // 完走チェック
  if (distance >= ROUTE_DATA.totalDistance) {
    return {
      currentCity: cities[cities.length - 1],
      nextCity: null,
      progress: 100,
      distanceToNext: 0,
      isCompleted: true
    };
  }
  
  // 現在地と次の都市を特定
  let currentCity = cities[0];
  let nextCity = cities[1];
  
  for (let i = 0; i < cities.length - 1; i++) {
    if (distance >= cities[i].cumulative && distance < cities[i + 1].cumulative) {
      currentCity = cities[i];
      nextCity = cities[i + 1];
      break;
    }
  }
  
  // 次の都市までの距離
  const distanceToNext = nextCity.cumulative - distance;
  
  // 区間内の進捗率
  const segmentDistance = nextCity.cumulative - currentCity.cumulative;
  const segmentProgress = distance - currentCity.cumulative;
  const segmentPercent = (segmentProgress / segmentDistance) * 100;
  
  // 全体の進捗率
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

/**
 * 指定した都市に到達したかチェック
 * @param {number} oldDistance - 前回の累計距離
 * @param {number} newDistance - 新しい累計距離
 * @returns {array} 新たに到達した都市の配列
 */
function getNewlyReachedCities(oldDistance, newDistance) {
  return ROUTE_DATA.cities.filter(city => 
    city.cumulative > oldDistance && city.cumulative <= newDistance
  );
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ROUTE_DATA, getLocationByDistance, getNewlyReachedCities };
}
