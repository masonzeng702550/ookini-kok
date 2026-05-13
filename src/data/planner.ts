import type {
  Attraction,
  CityId,
  Itinerary,
  ItineraryDay,
  ItineraryStop,
} from '@/types';
import { ATTRACTIONS, ATTRACTION_BY_ID } from './attractions';
import { commuteBetweenCached, distanceKm } from './commute';

const DAY_BUDGET_MIN = 9 * 60; // ~9h sightseeing per day

// ─── Helpers ────────────────────────────────────────────────────────────
function avgCoord(items: Attraction[]): [number, number] {
  let lng = 0;
  let lat = 0;
  for (const a of items) {
    lng += a.coord[0];
    lat += a.coord[1];
  }
  return [lng / items.length, lat / items.length];
}

// ─── Clustering by coord (k-means lite for daily buckets) ──────────────
function clusterIntoDays(items: Attraction[], k: number): Attraction[][] {
  if (items.length === 0) return Array.from({ length: k }, () => []);
  if (k <= 1) return [items.slice()];
  if (items.length <= k) return items.map((a) => [a]);

  // Initialize centroids using farthest-point seeding for spread
  const centroids: [number, number][] = [items[0].coord.slice() as [number, number]];
  while (centroids.length < k) {
    let bestIdx = -1;
    let bestDist = -1;
    for (let i = 0; i < items.length; i++) {
      const c = items[i].coord;
      let minDistToCent = Infinity;
      for (const ct of centroids) {
        const d = distanceKm(c, ct);
        if (d < minDistToCent) minDistToCent = d;
      }
      if (minDistToCent > bestDist) {
        bestDist = minDistToCent;
        bestIdx = i;
      }
    }
    centroids.push(items[bestIdx].coord.slice() as [number, number]);
  }

  let assignment = new Array<number>(items.length).fill(0);
  for (let iter = 0; iter < 25; iter++) {
    // Assign
    const next = new Array<number>(items.length);
    for (let i = 0; i < items.length; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = distanceKm(items[i].coord, centroids[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      next[i] = best;
    }
    let changed = false;
    for (let i = 0; i < items.length; i++) {
      if (next[i] !== assignment[i]) {
        changed = true;
        break;
      }
    }
    assignment = next;
    if (!changed) break;
    // Recompute centroids
    for (let c = 0; c < k; c++) {
      const group = items.filter((_, i) => assignment[i] === c);
      if (group.length > 0) centroids[c] = avgCoord(group);
    }
  }

  // Reassign empty clusters by stealing the largest one's outlier
  const buckets: Attraction[][] = Array.from({ length: k }, () => []);
  items.forEach((a, i) => buckets[assignment[i]].push(a));
  for (let c = 0; c < k; c++) {
    if (buckets[c].length > 0) continue;
    // Steal one item from the largest bucket
    let biggest = 0;
    for (let j = 1; j < k; j++) if (buckets[j].length > buckets[biggest].length) biggest = j;
    if (buckets[biggest].length > 1) {
      buckets[c].push(buckets[biggest].pop()!);
    }
  }
  return buckets;
}

// ─── Nearest-neighbor ordering within a day ────────────────────────────
function orderByNearestNeighbor(items: Attraction[]): Attraction[] {
  if (items.length <= 1) return items.slice();
  // Start from the attraction nearest to the centroid of the day's items
  // (gives a more central starting point than picking arbitrarily).
  const centroid = avgCoord(items);
  let startIdx = 0;
  let startDist = Infinity;
  for (let i = 0; i < items.length; i++) {
    const d = distanceKm(items[i].coord, centroid);
    if (d < startDist) {
      startDist = d;
      startIdx = i;
    }
  }
  const ordered: Attraction[] = [items[startIdx]];
  const remaining = items.filter((_, i) => i !== startIdx);
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestT = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const plan = commuteBetweenCached(last, remaining[i]);
      if (plan.totalMinutes < bestT) {
        bestT = plan.totalMinutes;
        bestIdx = i;
      }
    }
    ordered.push(remaining.splice(bestIdx, 1)[0]);
  }
  return ordered;
}

// ─── Build a day from an ordered attraction list, capping at DAY_BUDGET ─
function buildDay(dayIndex: number, ordered: Attraction[]): {
  day: ItineraryDay;
  overflow: Attraction[];
} {
  const stops: ItineraryStop[] = [];
  let stayMinutes = 0;
  let commuteMinutes = 0;
  let used = 0;
  let overflow: Attraction[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const a = ordered[i];
    let commute = undefined as ItineraryStop['commute'];
    if (stops.length > 0) {
      const prev = ATTRACTION_BY_ID[stops[stops.length - 1].attractionId];
      commute = commuteBetweenCached(prev, a);
    }
    const stay = a.duration ?? 60;
    const add = (commute?.totalMinutes ?? 0) + stay;
    if (stops.length > 0 && used + add > DAY_BUDGET_MIN + 60) {
      overflow = ordered.slice(i);
      break;
    }
    stops.push({ attractionId: a.id, stayMinutes: stay, commute });
    stayMinutes += stay;
    commuteMinutes += commute?.totalMinutes ?? 0;
    used += add;
  }
  return {
    day: { dayIndex, stops, stayMinutes, commuteMinutes },
    overflow,
  };
}

// ─── Main entry: manual plan ───────────────────────────────────────────
export function planItinerary(
  selectedIds: string[],
  dayCount: number,
): Itinerary {
  const items = selectedIds
    .map((id) => ATTRACTION_BY_ID[id])
    .filter((a): a is Attraction => Boolean(a) && (a.duration ?? 0) > 0);

  const k = Math.max(1, Math.min(dayCount, 7));
  const clusters = clusterIntoDays(items, k);
  const days: ItineraryDay[] = [];
  let carry: Attraction[] = [];
  for (let i = 0; i < k; i++) {
    const dayItems = [...clusters[i], ...carry];
    carry = [];
    const ordered = orderByNearestNeighbor(dayItems);
    const built = buildDay(i, ordered);
    days.push(built.day);
    carry = built.overflow;
  }
  // Redistribute leftovers into days with slack (best-fit) instead of dumping
  // everything on the last day. Items that can't reasonably fit anywhere are
  // dropped — the planner doesn't fabricate 17-hour days.
  for (const a of carry) {
    const stay = a.duration ?? 60;
    let bestDay = -1;
    let bestSlack = -Infinity;
    for (let d = 0; d < days.length; d++) {
      const used = days[d].stayMinutes + days[d].commuteMinutes;
      const slack = DAY_BUDGET_MIN + 30 - used - stay;
      if (slack > bestSlack) {
        bestSlack = slack;
        bestDay = d;
      }
    }
    if (bestDay < 0 || bestSlack < -45) continue;
    const day = days[bestDay];
    const prevId = day.stops[day.stops.length - 1]?.attractionId;
    const commute = prevId
      ? commuteBetweenCached(ATTRACTION_BY_ID[prevId], a)
      : undefined;
    day.stops.push({ attractionId: a.id, stayMinutes: stay, commute });
    day.stayMinutes += stay;
    day.commuteMinutes += commute?.totalMinutes ?? 0;
  }
  return {
    days,
    meta: {
      selectedIds,
      dayCount,
      regions: [...new Set(items.map((a) => a.cityId))],
      mode: 'manual',
    },
  };
}

// ─── Recommendation: pick best attractions for region + days ────────────
function attractionScore(a: Attraction): number {
  let s = 1;
  if (a.tags?.includes('top-rated')) s += 4;
  if (a.tags?.includes('photogenic')) s += 1;
  if (a.tags?.includes('family')) s += 0.8;
  return s;
}

export function recommendItinerary(
  regions: CityId[],
  dayCount: number,
): Itinerary {
  const pool = ATTRACTIONS.filter(
    (a) => (a.duration ?? 0) > 0 && regions.includes(a.cityId),
  );
  const ranked = pool.slice().sort((a, b) => attractionScore(b) - attractionScore(a));

  // Budget-aware picking: reserve ~30% of the day for commute.
  // Skip individual attractions that would single-handedly burn an entire
  // day's stay budget unless they're the highest-rated item left to pick.
  const totalBudget = dayCount * DAY_BUDGET_MIN * 0.7;
  const perDayCap = DAY_BUDGET_MIN * 0.95;
  let usedStay = 0;
  const picked: Attraction[] = [];
  for (const a of ranked) {
    const stay = a.duration ?? 60;
    if (stay > perDayCap && picked.length > 0) continue;
    if (usedStay + stay > totalBudget) continue;
    picked.push(a);
    usedStay += stay;
    if (picked.length >= dayCount * 5) break;
  }
  // Fallback: if we picked nothing (e.g., only USJ in region), force one
  if (picked.length === 0 && ranked.length > 0) picked.push(ranked[0]);

  const it = planItinerary(picked.map((a) => a.id), dayCount);
  it.meta.mode = 'recommend';
  it.meta.regions = regions;
  return it;
}
