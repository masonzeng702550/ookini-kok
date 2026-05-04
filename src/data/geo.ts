import type { Feature, FeatureCollection, LineString, Polygon } from 'geojson';
import { DISTRICTS } from './districts';
import { RAILWAYS } from './railways';

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
      geometry: { type: 'LineString', coordinates: r.path },
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
