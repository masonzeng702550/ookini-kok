import type { Itinerary, CommuteSegment } from '@/types';
import { RAILWAY_BY_ID } from './railways';

export interface KansaiPass {
  id: string;
  name_zh: string;
  name_jp: string;
  priceYen: number;
  /** How many days of validity (0 for advisory / pay-as-you-go). */
  validDays: number;
  coverage: string;
  excludes?: string;
  url?: string;
}

export const KANSAI_PASSES: KansaiPass[] = [
  {
    id: 'kansai-thru-2',
    name_zh: 'KANSAI THRU PASS 2 日券',
    name_jp: '関西スルーパス 2日券',
    priceYen: 4480,
    validDays: 2,
    coverage:
      '近畿圈所有私鐵、地下鐵、市營巴士（不含JR）。可不連續日使用。',
    excludes: 'JR西日本各路線、新幹線、機場巴士。',
    url: 'https://www.surutto.com/kansai_rw/zh-tw/',
  },
  {
    id: 'kansai-thru-3',
    name_zh: 'KANSAI THRU PASS 3 日券',
    name_jp: '関西スルーパス 3日券',
    priceYen: 5600,
    validDays: 3,
    coverage:
      '近畿圈所有私鐵、地下鐵、市營巴士（不含JR）。可不連續日使用。',
    excludes: 'JR西日本各路線、新幹線、機場巴士。',
    url: 'https://www.surutto.com/kansai_rw/zh-tw/',
  },
  {
    id: 'jr-kansai-wide-5',
    name_zh: 'JR 關西廣域周遊券 5 日',
    name_jp: 'JR関西ワイドエリアパス',
    priceYen: 12000,
    validDays: 5,
    coverage:
      'JR西日本指定區間自由乘坐，含部分新幹線（新大阪～岡山）。連續 5 日。',
    excludes: '私鐵、地下鐵、市營巴士。',
    url: 'https://www.westjr.co.jp/global/tc/ticket/pass/kansai_wide/',
  },
  {
    id: 'osaka-amazing-1',
    name_zh: '大阪周遊卡 1 日券',
    name_jp: '大阪周遊パス',
    priceYen: 2800,
    validDays: 1,
    coverage:
      '大阪Metro、大阪市營巴士、部分私鐵大阪市區段，含 40+ 景點免費入場。',
    excludes: 'JR、近郊區段。',
    url: 'https://www.osaka-info.jp/osp/cht/',
  },
  {
    id: 'osaka-metro-day-1',
    name_zh: '大阪地下鐵 1 日券',
    name_jp: '大阪メトロ1日乗車券エンジョイエコカード',
    priceYen: 820,
    validDays: 1,
    coverage: '大阪Metro 全線及大阪市營巴士 1 日無限搭乘。',
    excludes: '其他私鐵與JR、近郊區段。',
    url: 'https://subway.osakametro.co.jp/guide/page/enjoy-eco.php',
  },
  {
    id: 'icoca-charge',
    name_zh: 'ICOCA 一卡通儲值',
    name_jp: 'ICOCAチャージ',
    priceYen: 0,
    validDays: 0,
    coverage:
      '預設儲值卡，按實際乘車距離計費。短程或行程分散時最划算。',
    url: 'https://www.westjr.co.jp/global/tc/ticket/icoca/',
  },
];

// ─── Coverage heuristics ────────────────────────────────────────────────
// Map operator labels (from Railway.operator) to coarse coverage buckets.
const JR_OPERATORS = new Set(['JR西日本']);
const OSAKA_METRO_OPERATORS = new Set(['大阪Metro']);
// "Private" rail in the Kansai Thru sense: everything that isn't JR.
function isJrLine(railwayId: string | undefined): boolean {
  if (!railwayId) return false;
  const r = RAILWAY_BY_ID[railwayId];
  if (!r) return false;
  return JR_OPERATORS.has(r.operator);
}

function isOsakaMetro(railwayId: string | undefined): boolean {
  if (!railwayId) return false;
  const r = RAILWAY_BY_ID[railwayId];
  if (!r) return false;
  return OSAKA_METRO_OPERATORS.has(r.operator);
}

function isPrivateOrMetro(railwayId: string | undefined): boolean {
  if (!railwayId) return false;
  const r = RAILWAY_BY_ID[railwayId];
  if (!r) return false;
  return !JR_OPERATORS.has(r.operator);
}

function segmentCoveredBy(passId: string, seg: CommuteSegment): boolean {
  if (seg.mode !== 'train' || !seg.fareYen) return false;
  if (passId === 'kansai-thru-2' || passId === 'kansai-thru-3') {
    return isPrivateOrMetro(seg.railwayId);
  }
  if (passId === 'jr-kansai-wide-5') {
    return isJrLine(seg.railwayId);
  }
  if (passId === 'osaka-amazing-1' || passId === 'osaka-metro-day-1') {
    return isOsakaMetro(seg.railwayId);
  }
  // ICOCA covers everything but provides no savings (pay-as-you-go).
  return false;
}

export interface PassComparisonRow {
  pass: KansaiPass;
  /** Yen of trip fare the pass could cover (within its valid-day window). */
  useableYen: number;
  /** useableYen - priceYen (negative if pass costs more than savings). */
  netSaving: number;
}

export interface PassRecommendation {
  recommended: KansaiPass | null;
  savingsYen: number;
  comparison: PassComparisonRow[];
}

/**
 * Greedy: for each pass, pick the consecutive `validDays` window of days that
 * accumulates the most covered fare. If `validDays` >= itinerary days, simply
 * sum every covered segment. ICOCA is included as the "no pass" baseline.
 */
export function recommendPass(itinerary: Itinerary): PassRecommendation {
  const dayCoverByPass = new Map<string, number[]>();
  for (const pass of KANSAI_PASSES) {
    const perDay: number[] = [];
    for (const day of itinerary.days) {
      let dayCovered = 0;
      for (const stop of day.stops) {
        if (!stop.commute) continue;
        for (const seg of stop.commute.segments) {
          if (segmentCoveredBy(pass.id, seg) && seg.fareYen) {
            dayCovered += seg.fareYen;
          }
        }
      }
      perDay.push(dayCovered);
    }
    dayCoverByPass.set(pass.id, perDay);
  }

  const comparison: PassComparisonRow[] = KANSAI_PASSES.map((pass) => {
    const perDay = dayCoverByPass.get(pass.id) ?? [];
    let useableYen = 0;
    if (pass.validDays <= 0) {
      // ICOCA — covers all but no savings, treat useable = 0.
      useableYen = 0;
    } else if (pass.validDays >= perDay.length) {
      useableYen = perDay.reduce((s, v) => s + v, 0);
    } else {
      // Best sliding window of `validDays` consecutive days.
      let windowSum = 0;
      for (let i = 0; i < pass.validDays; i++) windowSum += perDay[i];
      let best = windowSum;
      for (let i = pass.validDays; i < perDay.length; i++) {
        windowSum += perDay[i] - perDay[i - pass.validDays];
        if (windowSum > best) best = windowSum;
      }
      useableYen = best;
    }
    const netSaving = useableYen - pass.priceYen;
    return { pass, useableYen, netSaving };
  });

  let best: PassComparisonRow | null = null;
  for (const row of comparison) {
    if (row.pass.validDays <= 0) continue; // skip ICOCA from "recommended"
    if (row.netSaving <= 0) continue;
    if (!best || row.netSaving > best.netSaving) best = row;
  }

  return {
    recommended: best?.pass ?? null,
    savingsYen: best?.netSaving ?? 0,
    comparison,
  };
}
