import type { Feature, FeatureCollection, LineString, Polygon } from 'geojson';
import { DISTRICTS } from './districts';
import { RAILWAYS } from './railways';
import type { LngLat } from '@/types';

/**
 * Catmull-Rom spline interpolation between two control points, with the
 * adjacent points on each side defining the tangent. Returns `segments`
 * intermediate points between p1 and p2 (excluding endpoints).
 */
function catmullRom(
  p0: LngLat,
  p1: LngLat,
  p2: LngLat,
  p3: LngLat,
  segments: number,
): LngLat[] {
  const out: LngLat[] = [];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const t2 = t * t;
    const t3 = t2 * t;
    const x =
      0.5 *
      (2 * p1[0] +
        (-p0[0] + p2[0]) * t +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
    const y =
      0.5 *
      (2 * p1[1] +
        (-p0[1] + p2[1]) * t +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
    out.push([x, y]);
  }
  return out;
}

/**
 * Smooths a polyline by inserting Catmull-Rom interpolated points between
 * every pair of adjacent vertices. The original control points are kept so
 * stations always sit exactly on the curve.
 */
function smoothPath(coords: LngLat[], segments = 10): LngLat[] {
  if (coords.length < 3) return coords;
  const out: LngLat[] = [coords[0]];
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];
    out.push(...catmullRom(p0, p1, p2, p3, segments));
    out.push(p2);
  }
  return out;
}

export function railwaysToGeoJSON(): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features: RAILWAYS.map<Feature<LineString>>((r) => ({
      type: 'Feature',
      properties: {
        id: r.id,
        name_zh: r.name_zh,
        operator: r.operator,
        color: r.color,
      },
      geometry: { type: 'LineString', coordinates: smoothPath(r.path) },
    })),
  };
}

export function districtsToGeoJSON(): FeatureCollection<Polygon> {
  // Closed ring for each polygon
  return {
    type: 'FeatureCollection',
    features: DISTRICTS.map<Feature<Polygon>>((d) => {
      const ring = d.bounds.slice();
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        ring.push(first);
      }
      return {
        type: 'Feature',
        properties: {
          id: d.id,
          cityId: d.cityId,
          name_zh: d.name_zh,
          color:
            d.cityId === 'osaka' ? '#e63946' :
            d.cityId === 'kyoto' ? '#b7295a' :
            d.cityId === 'kobe' ? '#2a7da3' :
            d.cityId === 'nara' ? '#6fbe3f' :
            '#ff7a00',
        },
        geometry: { type: 'Polygon', coordinates: [ring] },
      };
    }),
  };
}
