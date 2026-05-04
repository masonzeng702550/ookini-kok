import type { District } from '@/types';

// Approximate convex polygons drawn around the real cluster of attractions
// for each district. Not aligned to administrative boundaries — purely a
// visual hint at zoom levels 10–11.
export const DISTRICTS: District[] = [
  // ─── KYOTO ─────────────────────────────────────────────────────────────
  {
    id: 'kyoto-higashiyama',
    cityId: 'kyoto',
    name_zh: '東山區',
    description: '清水寺、祇園、八坂神社等寺社精華',
    bounds: [
      [135.770, 34.985],
      [135.795, 34.985],
      [135.800, 35.010],
      [135.778, 35.020],
      [135.760, 35.005],
    ],
    labelCoord: [135.782, 35.0],
  },
  {
    id: 'kyoto-arashiyama',
    cityId: 'kyoto',
    name_zh: '嵐山區',
    description: '竹林、渡月橋、天龍寺',
    bounds: [
      [135.660, 35.005],
      [135.685, 35.000],
      [135.695, 35.020],
      [135.675, 35.030],
      [135.658, 35.020],
    ],
    labelCoord: [135.677, 35.014],
  },
  {
    id: 'kyoto-rakuhoku',
    cityId: 'kyoto',
    name_zh: '洛北區',
    description: '金閣寺、龍安寺、貴船、鞍馬',
    bounds: [
      [135.700, 35.030],
      [135.760, 35.030],
      [135.785, 35.080],
      [135.730, 35.115],
      [135.690, 35.080],
    ],
    labelCoord: [135.738, 35.060],
  },
  {
    id: 'kyoto-rakuchu',
    cityId: 'kyoto',
    name_zh: '洛中（市中心）',
    description: '錦市場、二条城、四条河原町、先斗町',
    bounds: [
      [135.745, 35.000],
      [135.775, 35.000],
      [135.778, 35.025],
      [135.745, 35.025],
    ],
    labelCoord: [135.760, 35.012],
  },
  {
    id: 'kyoto-rakunan',
    cityId: 'kyoto',
    name_zh: '洛南區',
    description: '伏見稻荷、宇治、月桂冠',
    bounds: [
      [135.745, 34.870],
      [135.815, 34.870],
      [135.825, 34.975],
      [135.760, 34.975],
    ],
    labelCoord: [135.785, 34.92],
  },

  // ─── OSAKA ─────────────────────────────────────────────────────────────
  {
    id: 'osaka-namba',
    cityId: 'osaka',
    name_zh: '難波/心齋橋',
    description: '道頓堀、心齋橋筋、黑門市場',
    bounds: [
      [135.490, 34.660],
      [135.515, 34.660],
      [135.518, 34.680],
      [135.490, 34.680],
    ],
    labelCoord: [135.503, 34.670],
  },
  {
    id: 'osaka-umeda',
    cityId: 'osaka',
    name_zh: '梅田（北區）',
    description: '空中庭園、Grand Front、北新地',
    bounds: [
      [135.490, 34.700],
      [135.515, 34.700],
      [135.515, 34.715],
      [135.490, 34.715],
    ],
    labelCoord: [135.500, 34.706],
  },
  {
    id: 'osaka-bay',
    cityId: 'osaka',
    name_zh: '大阪港/灣區',
    description: 'USJ、海遊館、天保山摩天輪',
    bounds: [
      [135.420, 34.645],
      [135.470, 34.645],
      [135.470, 34.680],
      [135.420, 34.680],
    ],
    labelCoord: [135.445, 34.66],
  },
  {
    id: 'osaka-tennoji',
    cityId: 'osaka',
    name_zh: '天王寺/阿倍野',
    description: 'Abeno Harukas、通天閣、新世界',
    bounds: [
      [135.495, 34.640],
      [135.520, 34.640],
      [135.520, 34.660],
      [135.495, 34.660],
    ],
    labelCoord: [135.510, 34.648],
  },
  {
    id: 'osaka-castle',
    cityId: 'osaka',
    name_zh: '大阪城區',
    description: '天守閣、公園、歷史博物館',
    bounds: [
      [135.515, 34.675],
      [135.545, 34.675],
      [135.545, 34.700],
      [135.515, 34.700],
    ],
    labelCoord: [135.530, 34.687],
  },

  // ─── KOBE ──────────────────────────────────────────────────────────────
  {
    id: 'kobe-sannomiya',
    cityId: 'kobe',
    name_zh: '三之宮/元町',
    description: '生田神社、南京町、舊居留地',
    bounds: [
      [135.180, 34.685],
      [135.205, 34.685],
      [135.205, 34.703],
      [135.180, 34.703],
    ],
    labelCoord: [135.193, 34.695],
  },
  {
    id: 'kobe-kitano',
    cityId: 'kobe',
    name_zh: '北野',
    description: '北野異人館街、星巴克北野店',
    bounds: [
      [135.185, 34.700],
      [135.200, 34.700],
      [135.200, 34.712],
      [135.185, 34.712],
    ],
    labelCoord: [135.193, 34.706],
  },
  {
    id: 'kobe-harbor',
    cityId: 'kobe',
    name_zh: '神戶港/Harborland',
    description: '港塔、摩賽克、BE KOBE 地標',
    bounds: [
      [135.175, 34.670],
      [135.200, 34.670],
      [135.200, 34.685],
      [135.175, 34.685],
    ],
    labelCoord: [135.187, 34.678],
  },
  {
    id: 'kobe-arima',
    cityId: 'kobe',
    name_zh: '有馬/六甲山',
    description: '溫泉老街、金之湯/銀之湯、六甲夜景',
    bounds: [
      [135.225, 34.780],
      [135.270, 34.780],
      [135.270, 34.815],
      [135.225, 34.815],
    ],
    labelCoord: [135.247, 34.798],
  },

  // ─── NARA ──────────────────────────────────────────────────────────────
  {
    id: 'nara-park',
    cityId: 'nara',
    name_zh: '奈良公園周邊',
    description: '東大寺、春日大社、興福寺',
    bounds: [
      [135.830, 34.680],
      [135.860, 34.680],
      [135.860, 34.700],
      [135.830, 34.700],
    ],
    labelCoord: [135.843, 34.689],
  },
  {
    id: 'nara-naramachi',
    cityId: 'nara',
    name_zh: '奈良町',
    description: '格子之家、猿澤池、文青咖啡',
    bounds: [
      [135.825, 34.670],
      [135.845, 34.670],
      [135.845, 34.683],
      [135.825, 34.683],
    ],
    labelCoord: [135.834, 34.677],
  },
  {
    id: 'nara-nishinokyo',
    cityId: 'nara',
    name_zh: '西之京',
    description: '藥師寺、唐招提寺',
    bounds: [
      [135.780, 34.670],
      [135.805, 34.670],
      [135.805, 34.690],
      [135.780, 34.690],
    ],
    labelCoord: [135.793, 34.68],
  },
  {
    id: 'nara-ikaruga',
    cityId: 'nara',
    name_zh: '斑鳩',
    description: '法隆寺（世界遺產）',
    bounds: [
      [135.720, 34.605],
      [135.745, 34.605],
      [135.745, 34.625],
      [135.720, 34.625],
    ],
    labelCoord: [135.733, 34.614],
  },

  // ─── KIX & 泉州 ───────────────────────────────────────────────────────
  {
    id: 'kix-rinku',
    cityId: 'kix',
    name_zh: '臨空鎮',
    description: 'Rinku Outlets、臨空公園、大理石海灘',
    bounds: [
      [135.290, 34.400],
      [135.320, 34.400],
      [135.320, 34.420],
      [135.290, 34.420],
    ],
    labelCoord: [135.305, 34.41],
  },
  {
    id: 'kix-airport',
    cityId: 'kix',
    name_zh: '關西機場',
    description: '機場觀景台 Sky View、泉州溫泉',
    bounds: [
      [135.225, 34.425],
      [135.260, 34.425],
      [135.260, 34.450],
      [135.225, 34.450],
    ],
    labelCoord: [135.244, 34.434],
  },
];

export const DISTRICT_BY_ID: Record<string, District> = Object.fromEntries(
  DISTRICTS.map((d) => [d.id, d]),
);
