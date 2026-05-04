import type { StyleSpecification } from 'maplibre-gl';

// Minimal procedural style: solid dark background, no external tiles.
// All visible content (railways, districts) is added as runtime sources.
export const NEON_DARK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'bg',
      type: 'background',
      // Land is the base — sea polygons paint on top to show the bay
      paint: { 'background-color': '#f4ebd4' },
    },
  ],
};
