import type {
  Attraction,
  CommutePlan,
  CommuteSegment,
  LngLat,
  Railway,
} from '@/types';
import { RAILWAYS } from './railways';

// ─── Constants ──────────────────────────────────────────────────────────
const WALK_KMH = 4.5;          // city walking pace
const TRAIN_KMH = 32;          // average urban rail (incl. station dwell)
const WAIT_MIN = 3;            // mean platform wait per boarding
const TRANSFER_MIN = 4;        // walking + waiting when changing line at hub
const WALK_TRANSFER_M = 600;   // walking-transfer between same-name stops on
                               // different lines within this radius
const ATTRACTION_WALK_M = 1500; // attraction connects to any station within
                                // this walking radius

// ─── Geometry helpers ───────────────────────────────────────────────────
function haversineKm(a: LngLat, b: LngLat): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(s));
}

const walkMinutes = (km: number) => (km / WALK_KMH) * 60;
const trainMinutes = (km: number) => (km / TRAIN_KMH) * 60;

/**
 * Return the slice of `fullPath` that runs from the point closest to `from` to
 * the point closest to `to`, reversed if needed so the slice goes from→to. The
 * endpoints are snapped to the exact station coordinates so the resulting
 * polyline starts and ends precisely on each station marker.
 */
function slicePath(fullPath: LngLat[], from: LngLat, to: LngLat): LngLat[] {
  if (fullPath.length === 0) return [from, to];
  let fromIdx = 0;
  let toIdx = 0;
  let fromD = Infinity;
  let toD = Infinity;
  for (let i = 0; i < fullPath.length; i++) {
    const dxF = fullPath[i][0] - from[0];
    const dyF = fullPath[i][1] - from[1];
    const df = dxF * dxF + dyF * dyF;
    const dxT = fullPath[i][0] - to[0];
    const dyT = fullPath[i][1] - to[1];
    const dt = dxT * dxT + dyT * dyT;
    if (df < fromD) {
      fromD = df;
      fromIdx = i;
    }
    if (dt < toD) {
      toD = dt;
      toIdx = i;
    }
  }
  let slice: LngLat[];
  if (fromIdx <= toIdx) {
    slice = fullPath.slice(fromIdx, toIdx + 1).map((c) => [c[0], c[1]] as LngLat);
  } else {
    slice = fullPath
      .slice(toIdx, fromIdx + 1)
      .map((c) => [c[0], c[1]] as LngLat)
      .reverse();
  }
  if (slice.length === 0) return [from, to];
  slice[0] = from;
  slice[slice.length - 1] = to;
  return slice;
}

// ─── Graph build ────────────────────────────────────────────────────────
// Each (railwayId, stationName) is its own node so we can attribute time to
// a specific line. Same name across operators becomes connected via a short
// transfer edge.
interface RailNode {
  key: string;
  railwayId: string;
  stationName: string;
  coord: LngLat;
  railway: Railway;
}

interface Edge {
  to: string;
  minutes: number;
  kind: 'rail' | 'transfer' | 'walk';
  /** Railway id when kind === 'rail'. */
  railwayId?: string;
  /** "from" station label for nice itinerary output. */
  fromStation?: string;
  toStation?: string;
  /** Distance in meters for walk segments. */
  meters?: number;
}

const NODES = new Map<string, RailNode>();
const ADJ = new Map<string, Edge[]>();

function key(railwayId: string, stationName: string) {
  return `${railwayId}::${stationName}`;
}

function addEdge(from: string, edge: Edge) {
  const list = ADJ.get(from);
  if (list) list.push(edge);
  else ADJ.set(from, [edge]);
}

// 1. Rail edges between adjacent stations on the same line
for (const r of RAILWAYS) {
  for (let i = 0; i < r.stations.length; i++) {
    const s = r.stations[i];
    const k = key(r.id, s.name_zh);
    NODES.set(k, {
      key: k,
      railwayId: r.id,
      stationName: s.name_zh,
      coord: s.coord,
      railway: r,
    });
    if (i > 0) {
      const prev = r.stations[i - 1];
      const km = haversineKm(prev.coord, s.coord);
      const m = trainMinutes(km) + WAIT_MIN / Math.max(r.stations.length, 1);
      addEdge(key(r.id, prev.name_zh), {
        to: k,
        minutes: m,
        kind: 'rail',
        railwayId: r.id,
        fromStation: prev.name_zh,
        toStation: s.name_zh,
      });
      addEdge(k, {
        to: key(r.id, prev.name_zh),
        minutes: m,
        kind: 'rail',
        railwayId: r.id,
        fromStation: s.name_zh,
        toStation: prev.name_zh,
      });
    }
  }
}

// 2. Transfer edges: same station name across different railways
const byName = new Map<string, RailNode[]>();
for (const n of NODES.values()) {
  const arr = byName.get(n.stationName);
  if (arr) arr.push(n);
  else byName.set(n.stationName, [n]);
}
for (const group of byName.values()) {
  if (group.length < 2) continue;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i];
      const b = group[j];
      addEdge(a.key, {
        to: b.key,
        minutes: TRANSFER_MIN,
        kind: 'transfer',
        fromStation: a.stationName,
        toStation: b.stationName,
      });
      addEdge(b.key, {
        to: a.key,
        minutes: TRANSFER_MIN,
        kind: 'transfer',
        fromStation: b.stationName,
        toStation: a.stationName,
      });
    }
  }
}

// 3. Walking transfers between nearby stations of different names
const NODE_LIST = [...NODES.values()];
for (let i = 0; i < NODE_LIST.length; i++) {
  for (let j = i + 1; j < NODE_LIST.length; j++) {
    const a = NODE_LIST[i];
    const b = NODE_LIST[j];
    if (a.stationName === b.stationName) continue;
    const km = haversineKm(a.coord, b.coord);
    const meters = km * 1000;
    if (meters > WALK_TRANSFER_M) continue;
    const minutes = Math.max(walkMinutes(km), 2);
    addEdge(a.key, {
      to: b.key,
      minutes,
      kind: 'walk',
      meters,
      fromStation: a.stationName,
      toStation: b.stationName,
    });
    addEdge(b.key, {
      to: a.key,
      minutes,
      kind: 'walk',
      meters,
      fromStation: b.stationName,
      toStation: a.stationName,
    });
  }
}

// ─── Attraction → nearest rail nodes ────────────────────────────────────
interface AttractionAccess {
  node: RailNode;
  minutes: number;
  meters: number;
}

function attractionAccessPoints(coord: LngLat): AttractionAccess[] {
  const out: AttractionAccess[] = [];
  for (const n of NODE_LIST) {
    const km = haversineKm(coord, n.coord);
    const meters = km * 1000;
    if (meters > ATTRACTION_WALK_M) continue;
    out.push({ node: n, minutes: walkMinutes(km), meters });
  }
  // Always provide at least one access point — fall back to closest 3
  if (out.length === 0) {
    const sorted = NODE_LIST
      .map((n) => {
        const km = haversineKm(coord, n.coord);
        return { node: n, minutes: walkMinutes(km), meters: km * 1000 };
      })
      .sort((a, b) => a.meters - b.meters)
      .slice(0, 3);
    out.push(...sorted);
  }
  return out;
}

// ─── Min-heap (binary) ──────────────────────────────────────────────────
class MinHeap<T> {
  private a: { p: number; v: T }[] = [];
  size() {
    return this.a.length;
  }
  push(p: number, v: T) {
    this.a.push({ p, v });
    this.bubbleUp(this.a.length - 1);
  }
  pop(): { p: number; v: T } | undefined {
    if (this.a.length === 0) return undefined;
    const top = this.a[0];
    const last = this.a.pop()!;
    if (this.a.length > 0) {
      this.a[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }
  private bubbleUp(i: number) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.a[parent].p <= this.a[i].p) break;
      [this.a[parent], this.a[i]] = [this.a[i], this.a[parent]];
      i = parent;
    }
  }
  private bubbleDown(i: number) {
    const n = this.a.length;
    while (true) {
      const l = i * 2 + 1;
      const r = i * 2 + 2;
      let best = i;
      if (l < n && this.a[l].p < this.a[best].p) best = l;
      if (r < n && this.a[r].p < this.a[best].p) best = r;
      if (best === i) break;
      [this.a[best], this.a[i]] = [this.a[i], this.a[best]];
      i = best;
    }
  }
}

interface PrevEntry {
  from: string;
  edge: Edge;
}

function dijkstra(
  sources: { key: string; minutes: number }[],
  targetSet: Set<string>,
) {
  const dist = new Map<string, number>();
  const prev = new Map<string, PrevEntry>();
  const heap = new MinHeap<string>();
  for (const s of sources) {
    if (!dist.has(s.key) || s.minutes < dist.get(s.key)!) {
      dist.set(s.key, s.minutes);
      heap.push(s.minutes, s.key);
    }
  }
  let best: { key: string; minutes: number } | null = null;
  while (heap.size() > 0) {
    const top = heap.pop()!;
    if (top.p !== dist.get(top.v)) continue;
    if (targetSet.has(top.v)) {
      if (!best || top.p < best.minutes) best = { key: top.v, minutes: top.p };
      // We could break here but reaching multiple targets lets us pick the best
      // among different lines serving the destination. Keep scanning until the
      // heap top exceeds current best.
      continue;
    }
    if (best && top.p >= best.minutes) break;
    const edges = ADJ.get(top.v);
    if (!edges) continue;
    for (const e of edges) {
      const nd = top.p + e.minutes;
      const cur = dist.get(e.to);
      if (cur === undefined || nd < cur) {
        dist.set(e.to, nd);
        prev.set(e.to, { from: top.v, edge: e });
        heap.push(nd, e.to);
      }
    }
  }
  return { dist, prev, best };
}

// ─── Public API ─────────────────────────────────────────────────────────

/**
 * Compute commute plan from attraction A to attraction B.
 *
 * For very-close pairs (< 1 km walking) we just return a walk segment;
 * otherwise we run Dijkstra across the rail graph from every access point
 * near A to every access point near B, and rebuild the segment list
 * collapsing consecutive same-line rail hops into one "搭 X 線 N 站" segment.
 */
export function commuteBetween(
  from: Attraction,
  to: Attraction,
): CommutePlan {
  // Direct walk shortcut for close attractions
  const directKm = haversineKm(from.coord, to.coord);
  if (directKm < 1.2) {
    const minutes = walkMinutes(directKm);
    return {
      totalMinutes: minutes,
      segments: [
        {
          mode: 'walk',
          minutes,
          meters: directKm * 1000,
          label: `步行 ${Math.round(minutes)} 分`,
        },
      ],
      path: [from.coord, to.coord],
    };
  }

  const fromAccess = attractionAccessPoints(from.coord);
  const toAccess = attractionAccessPoints(to.coord);
  const targets = new Map<string, number>();
  for (const t of toAccess) targets.set(t.node.key, t.minutes);

  const sources = fromAccess.map((a) => ({ key: a.node.key, minutes: a.minutes }));
  const targetKeys = new Set(targets.keys());
  const { dist, prev, best } = dijkstra(sources, targetKeys);

  if (!best) {
    // Our railway data only models major lines, so some pairs (e.g. anywhere
    // in central Osaka ↔ Arashiyama via Hankyu Arashiyama line) come back
    // disconnected. Estimate as walk → straight-line rail → walk so the
    // planner doesn't think the trip needs 9 hours of walking.
    const railMin = trainMinutes(directKm) * 1.3 + WAIT_MIN * 2;
    const walkBuffer = 18; // ~9 min each end
    const minutes = railMin + walkBuffer;
    return {
      totalMinutes: minutes,
      segments: [
        {
          mode: 'train',
          minutes,
          label: `估算搭車約 ${Math.round(minutes)} 分（路線資料未涵蓋）`,
        },
      ],
      path: [from.coord, to.coord],
    };
  }

  // Best total = dist to that endpoint + walk into attraction at the end
  const walkOut = targets.get(best.key) ?? 0;
  const total = best.minutes + walkOut;

  // Reconstruct path back to a source node
  const path: Edge[] = [];
  let cur = best.key;
  while (prev.has(cur)) {
    const p = prev.get(cur)!;
    path.unshift(p.edge);
    cur = p.from;
  }

  // Build segments — collapse adjacent rail edges on same line
  const segments: CommuteSegment[] = [];
  const pathCoords: LngLat[] = [from.coord];
  const appendCoord = (c: LngLat) => {
    const last = pathCoords[pathCoords.length - 1];
    if (!last || last[0] !== c[0] || last[1] !== c[1]) pathCoords.push(c);
  };

  // Initial walk from attraction to first source node
  const firstSource = fromAccess.find((a) => a.node.key === cur);
  if (firstSource && firstSource.minutes > 0.5) {
    segments.push({
      mode: 'walk',
      minutes: firstSource.minutes,
      meters: firstSource.meters,
      label: `步行 ${Math.round(firstSource.minutes)} 分至 ${firstSource.node.stationName}`,
    });
  }
  if (firstSource) appendCoord(firstSource.node.coord);

  let railRun: {
    railwayId: string;
    minutes: number;
    stops: number;
    fromStation: string;
    toStation: string;
  } | null = null;

  const flushRail = () => {
    if (!railRun) return;
    const r = RAILWAYS.find((x) => x.id === railRun!.railwayId);
    segments.push({
      mode: 'train',
      minutes: railRun.minutes,
      railwayId: railRun.railwayId,
      fromStation: railRun.fromStation,
      toStation: railRun.toStation,
      label: `搭${r ? r.name_zh : railRun.railwayId} ${railRun.fromStation} → ${railRun.toStation}（${railRun.stops} 站 / ${Math.round(railRun.minutes)} 分）`,
    });
    // Append the railway-shaped slice between from/to stations to the path
    if (r) {
      const fromStn = r.stations.find((s) => s.name_zh === railRun!.fromStation);
      const toStn = r.stations.find((s) => s.name_zh === railRun!.toStation);
      if (fromStn && toStn) {
        for (const c of slicePath(r.path, fromStn.coord, toStn.coord)) {
          appendCoord(c);
        }
      } else if (toStn) {
        appendCoord(toStn.coord);
      }
    }
    railRun = null;
  };

  for (const e of path) {
    if (e.kind === 'rail') {
      if (railRun && railRun.railwayId === e.railwayId) {
        railRun.minutes += e.minutes;
        railRun.stops += 1;
        railRun.toStation = e.toStation!;
      } else {
        flushRail();
        railRun = {
          railwayId: e.railwayId!,
          minutes: e.minutes,
          stops: 1,
          fromStation: e.fromStation!,
          toStation: e.toStation!,
        };
      }
    } else if (e.kind === 'transfer') {
      flushRail();
      segments.push({
        mode: 'transfer',
        minutes: e.minutes,
        fromStation: e.fromStation,
        toStation: e.toStation,
        label: `${e.fromStation} 站內轉乘（${Math.round(e.minutes)} 分）`,
      });
      const toNode = NODES.get(e.to);
      if (toNode) appendCoord(toNode.coord);
    } else if (e.kind === 'walk') {
      flushRail();
      segments.push({
        mode: 'walk',
        minutes: e.minutes,
        meters: e.meters,
        fromStation: e.fromStation,
        toStation: e.toStation,
        label: `${e.fromStation} → ${e.toStation} 步行 ${Math.round(e.minutes)} 分`,
      });
      const toNode = NODES.get(e.to);
      if (toNode) appendCoord(toNode.coord);
    }
  }
  flushRail();

  // Final walk to the attraction
  if (walkOut > 0.5) {
    const endAccess = toAccess.find((a) => a.node.key === best.key);
    if (endAccess) {
      segments.push({
        mode: 'walk',
        minutes: walkOut,
        meters: endAccess.meters,
        label: `${endAccess.node.stationName} 步行 ${Math.round(walkOut)} 分至景點`,
      });
    }
  }
  appendCoord(to.coord);

  // If somehow all segments dropped, give a single combined walk
  if (segments.length === 0) {
    return {
      totalMinutes: total,
      segments: [
        {
          mode: 'walk',
          minutes: total,
          label: `步行 ${Math.round(total)} 分`,
        },
      ],
      path: [from.coord, to.coord],
    };
  }

  // Suppress unused dist var (kept for potential debug)
  void dist;

  return { totalMinutes: total, segments, path: pathCoords };
}

// ─── Memoization cache (recompute is non-trivial) ───────────────────────
const memo = new Map<string, CommutePlan>();
export function commuteBetweenCached(
  from: Attraction,
  to: Attraction,
): CommutePlan {
  const k = from.id < to.id ? `${from.id}|${to.id}` : `${to.id}|${from.id}`;
  let v = memo.get(k);
  if (!v) {
    v = commuteBetween(from, to);
    memo.set(k, v);
  }
  return v;
}

/** Convenience: rough straight-line distance in km. */
export function distanceKm(a: LngLat, b: LngLat): number {
  return haversineKm(a, b);
}
