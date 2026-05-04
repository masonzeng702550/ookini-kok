<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, h, render, type VNode } from 'vue';
import maplibregl, { Map as MlMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { NEON_DARK_STYLE } from './style';
import { CITIES } from '@/data/cities';
import { DISTRICTS } from '@/data/districts';
import { ATTRACTIONS } from '@/data/attractions';
import { STATIONS } from '@/data/stations';
import { railwaysToGeoJSON, districtsToGeoJSON } from '@/data/geo';
import type { MapStation } from '@/types';
import { useMapStore } from '@/stores/map';
import CityMarker from './CityMarker.vue';
import MapControls from './MapControls.vue';
import type { City } from '@/types';

const store = useMapStore();
const containerRef = ref<HTMLElement | null>(null);
let map: MlMap | null = null;
let cityMarkers: Marker[] = [];
let attractionMarkers: Marker[] = [];
let prefMarkers: Marker[] = [];
let stationMarkers: Marker[] = [];
let resizeObserver: ResizeObserver | null = null;

// Kansai bounds
const KANSAI_CENTER: [number, number] = [135.5, 34.75];
const KANSAI_BOUNDS: [[number, number], [number, number]] = [
  [134.4, 34.0],
  [136.3, 35.35],
];

function setVisibilityForZoom(z: number) {
  const level = z <= 9 ? 'overview' : z <= 11.2 ? 'district' : 'detail';
  store.setZoomLevel(level);

  if (!map) return;
  // Districts polygons appear at level >= 10
  for (const id of ['district-fill', 'district-outline', 'district-label']) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(
        id,
        'visibility',
        level === 'overview' ? 'none' : 'visible',
      );
    }
  }
  // Attraction markers only at detail; toggle display rather than opacity so
  // they don't capture pointer events (and stay out of the visual cluster
  // around big city markers at low zoom).
  attractionMarkers.forEach((m) => {
    const el = m.getElement();
    el.style.display = level === 'detail' ? '' : 'none';
  });
  // Prefecture labels are only useful at the overview zoom
  prefMarkers.forEach((m) => {
    const el = m.getElement();
    el.style.display = level === 'overview' ? '' : 'none';
  });
  // Stations: hide on overview (too cluttered), show district + detail
  stationMarkers.forEach((m) => {
    const el = m.getElement();
    el.style.display = level === 'overview' ? 'none' : '';
    // Slightly bigger labels at detail zoom
    const label = el.querySelector<HTMLElement>('.station-label');
    if (label) {
      label.style.fontSize = level === 'detail' ? '11px' : '10px';
    }
  });
  // City markers shrink slightly at detail so they don't dominate
  cityMarkers.forEach((m) => {
    const el = m.getElement();
    const inner = el.firstElementChild as HTMLElement | null;
    if (inner) {
      inner.style.transition = 'transform 200ms ease, opacity 200ms ease';
      inner.style.transform =
        level === 'detail' ? 'scale(0.55)' : level === 'district' ? 'scale(0.85)' : 'scale(1)';
    }
  });
}

function makeCityMarkerEl(city: City): HTMLElement {
  const wrap = document.createElement('div');
  const vnode: VNode = h(CityMarker, {
    city,
    active: store.activeCityId === city.id,
    onClick: (c: City) => {
      store.selectCity(c.id);
      map?.flyTo({ center: c.coord, zoom: 11, speed: 0.9 });
    },
  });
  render(vnode, wrap);
  // Stop pan when clicking marker
  wrap.style.cursor = 'pointer';
  return wrap;
}

function makeStationEl(s: MapStation): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'station-marker';
  const isHub = s.kind === 'hub';
  // Hub: bigger circle with thicker ring (suggests "interchange").
  // Terminus: smaller filled dot (suggests "endpoint").
  const dot = isHub
    ? `<div style="
         width: 14px; height: 14px;
         border-radius: 9999px;
         background: #fffaee;
         border: 3px solid ${s.primaryColor};
         box-shadow: 0 1px 3px rgba(58,47,36,0.35);
       "></div>`
    : `<div style="
         width: 10px; height: 10px;
         border-radius: 9999px;
         background: ${s.primaryColor};
         border: 2px solid #fffaee;
         box-shadow: 0 1px 3px rgba(58,47,36,0.35);
       "></div>`;
  wrap.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer; user-select:none;">
      ${dot}
      <div class="station-label" style="
        margin-top: 2px;
        padding: 0 4px;
        font-family: 'Be Vietnam Pro', system-ui, sans-serif;
        font-weight: 700;
        font-size: 10px;
        color: #3a2f24;
        background: rgba(255, 251, 240, 0.85);
        border-radius: 3px;
        white-space: nowrap;
        line-height: 1.2;
      ">${s.name_zh}</div>
    </div>`;
  wrap.title = `${s.name_zh}\n${s.lines.join(' / ')}`;
  return wrap;
}

function makePrefLabelEl(name: string, rome: string): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'pref-label';
  wrap.style.pointerEvents = 'none';
  wrap.innerHTML = `
    <div style="
      text-align: center;
      font-family: Epilogue, system-ui, sans-serif;
      font-weight: 800;
      letter-spacing: 0.18em;
      color: rgba(168, 150, 131, 0.55);
      text-shadow: 0 0 6px rgba(250, 243, 227, 0.9);
      user-select: none;
      white-space: nowrap;
    ">
      <div style="font-size: 18px;">${name}</div>
      <div style="
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700;
        font-size: 9px;
        letter-spacing: 0.3em;
        margin-top: 2px;
        opacity: 0.75;
      ">${rome}</div>
    </div>`;
  return wrap;
}

function makeAttractionEl(iconSymbol: string, color = '#e63946'): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'attraction-pin';
  wrap.innerHTML = `
    <div style="
      width: 32px; height: 32px;
      border-radius: 9999px;
      border: 2px solid ${color};
      background: #fffaee;
      display: grid; place-items: center;
      box-shadow: 0 3px 8px rgba(58,47,36,0.22), 0 1px 0 rgba(255,255,255,0.9) inset;
      cursor: pointer;
      transition: transform 200ms ease, box-shadow 200ms ease;
    ">
      <span class="material-symbols-outlined filled" style="
        color: ${color};
        font-size: 18px;
      ">${iconSymbol}</span>
    </div>`;
  wrap.addEventListener('mouseenter', () => {
    (wrap.firstElementChild as HTMLElement).style.transform = 'scale(1.18)';
  });
  wrap.addEventListener('mouseleave', () => {
    (wrap.firstElementChild as HTMLElement).style.transform = 'scale(1)';
  });
  return wrap;
}

onMounted(async () => {
  if (!containerRef.value) return;

  // Observe container size so the map redraws when the side drawer opens
  // or the viewport is resized (especially mobile <-> desktop).
  resizeObserver = new ResizeObserver(() => map?.resize());
  resizeObserver.observe(containerRef.value);

  map = new maplibregl.Map({
    container: containerRef.value,
    style: NEON_DARK_STYLE,
    center: KANSAI_CENTER,
    zoom: 8.4,
    minZoom: 7.5,
    maxZoom: 14,
    maxBounds: KANSAI_BOUNDS,
    attributionControl: { compact: true },
    pitchWithRotate: false,
    dragRotate: false,
    touchPitch: false,
    fadeDuration: 200,
    // Required so screenshots / canvas-to-image capture the rendered map
    preserveDrawingBuffer: true,
  });

  // Expose for debugging in dev
  if (import.meta.env.DEV) {
    (window as unknown as { __map: MlMap }).__map = map;
  }

  map.on('load', async () => {
    if (!map) return;

    // Base geography — load as inline data to avoid async fetch race that
    // can leave layers blank until the first user interaction. Use Vite's
    // BASE_URL so the path resolves correctly under any GitHub Pages prefix.
    const baseUrl = `${import.meta.env.BASE_URL}tiles/kansai-base.json`;
    const baseData = await fetch(baseUrl).then((r) => r.json());
    map.addSource('kansai-base', { type: 'geojson', data: baseData });

    // Sea (Osaka Bay + Kii Channel) painted on top of cream land bg
    map.addLayer({
      id: 'sea',
      type: 'fill',
      source: 'kansai-base',
      filter: ['==', ['get', 'kind'], 'sea'],
      paint: {
        'fill-color': '#a3d5e3',
        'fill-outline-color': '#3a8da3',
      },
    });
    // Coastline accent
    map.addLayer({
      id: 'sea-edge',
      type: 'line',
      source: 'kansai-base',
      filter: ['==', ['get', 'kind'], 'sea'],
      paint: {
        'line-color': '#3a8da3',
        'line-width': 1.6,
        'line-opacity': 0.85,
      },
    });
    // Awaji island
    map.addLayer({
      id: 'awaji-island',
      type: 'fill',
      source: 'kansai-base',
      filter: ['==', ['get', 'kind'], 'awaji-island'],
      paint: {
        'fill-color': '#f4ebd4',
      },
    });
    map.addLayer({
      id: 'awaji-island-edge',
      type: 'line',
      source: 'kansai-base',
      filter: ['==', ['get', 'kind'], 'awaji-island'],
      paint: {
        'line-color': '#3a8da3',
        'line-width': 1.4,
        'line-opacity': 0.9,
      },
    });
    // Mountains as sage-green blobs
    map.addLayer({
      id: 'mountains',
      type: 'fill',
      source: 'kansai-base',
      filter: ['==', ['get', 'kind'], 'mountains'],
      paint: {
        'fill-color': '#b2c99c',
        'fill-opacity': 0.85,
      },
    });
    map.addLayer({
      id: 'mountains-edge',
      type: 'line',
      source: 'kansai-base',
      filter: ['==', ['get', 'kind'], 'mountains'],
      paint: {
        'line-color': '#7e9863',
        'line-width': 1.2,
        'line-opacity': 0.85,
      },
    });
    map.addLayer({
      id: 'rivers',
      type: 'line',
      source: 'kansai-base',
      filter: ['==', ['get', 'kind'], 'river'],
      paint: {
        'line-color': '#5fb6c8',
        'line-width': 2.2,
        'line-opacity': 0.85,
      },
    });
    map.addLayer({
      id: 'kix-island',
      type: 'fill',
      source: 'kansai-base',
      filter: ['==', ['get', 'kind'], 'kix-island'],
      paint: {
        'fill-color': '#f4ebd4',
        'fill-outline-color': '#a3cdd9',
      },
    });

    // Prefecture (府縣) borders — soft dashed line, recessive
    map.addLayer({
      id: 'pref-border',
      type: 'line',
      source: 'kansai-base',
      filter: ['==', ['get', 'kind'], 'pref-border'],
      paint: {
        'line-color': '#a89683',
        'line-width': 1.2,
        'line-dasharray': [4, 3],
        'line-opacity': 0.55,
      },
    });

    // Districts ───────────────────────────────────────────────────────────
    map.addSource('districts', { type: 'geojson', data: districtsToGeoJSON() });
    map.addLayer({
      id: 'district-fill',
      type: 'fill',
      source: 'districts',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.14,
      },
    });
    map.addLayer({
      id: 'district-outline',
      type: 'line',
      source: 'districts',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1.4,
        'line-dasharray': [3, 2],
        'line-opacity': 0.75,
      },
    });

    // Railways ────────────────────────────────────────────────────────────
    map.addSource('railways', { type: 'geojson', data: railwaysToGeoJSON() });
    map.addLayer({
      id: 'rail-main',
      type: 'line',
      source: 'railways',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 3.2,
        'line-opacity': 0.95,
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' },
    });
    // Hover state
    map.on('mouseenter', 'rail-main', () => {
      if (map) map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'rail-main', () => {
      if (map) map.getCanvas().style.cursor = '';
    });
    // Click rail
    map.on('click', 'rail-main', (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const id = (f.properties as { id: string }).id;
      store.selectRailway(id);
    });
    // Click district (only when visible)
    map.on('click', 'district-fill', (e) => {
      const f = e.features?.[0];
      if (!f) return;
      const id = (f.properties as { id: string }).id;
      store.selectDistrict(id);
    });

    // Prefecture name labels ──────────────────────────────────────────────
    type PrefLabel = { name: string; rome: string; coord: [number, number] };
    const prefLabels: PrefLabel[] = baseData.features
      .filter(
        (f: { properties: { kind: string } }) =>
          f.properties.kind === 'pref-label',
      )
      .map(
        (f: {
          properties: { name: string; rome: string };
          geometry: { coordinates: [number, number] };
        }) => ({
          name: f.properties.name,
          rome: f.properties.rome,
          coord: f.geometry.coordinates,
        }),
      );
    prefMarkers = prefLabels.map((p) => {
      const el = makePrefLabelEl(p.name, p.rome);
      return new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(p.coord)
        .addTo(map!);
    });

    // Station markers (transfer hubs + line terminuses) ──────────────────
    stationMarkers = STATIONS.map((s) => {
      const el = makeStationEl(s);
      return new maplibregl.Marker({ element: el, anchor: 'top' })
        .setLngLat(s.coord)
        .addTo(map!);
    });

    // City markers ────────────────────────────────────────────────────────
    cityMarkers = CITIES.map((city) => {
      const el = makeCityMarkerEl(city);
      const m = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(city.coord)
        .addTo(map!);
      return m;
    });

    // Attraction markers ──────────────────────────────────────────────────
    attractionMarkers = ATTRACTIONS.map((a) => {
      const colorMap: Record<string, string> = {
        osaka: '#e63946',
        kyoto: '#b7295a',
        kobe: '#2a7da3',
        nara: '#6fbe3f',
        kix: '#ff7a00',
      };
      const el = makeAttractionEl(a.iconSymbol, colorMap[a.cityId] ?? '#FF007A');
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        store.selectAttraction(a.id);
        map?.flyTo({ center: a.coord, zoom: Math.max(map.getZoom(), 12.5), speed: 0.9 });
      });
      const m = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(a.coord)
        .addTo(map!);
      return m;
    });

    // Initial visibility
    setVisibilityForZoom(map.getZoom());
    map.on('zoom', () => {
      if (map) setVisibilityForZoom(map.getZoom());
    });

    // Workaround: a fresh MapLibre instance can finish loading without ever
    // pushing the rendered frame to the compositor — leaving the canvas
    // visually empty until the user interacts. We kick the render loop with
    // tiny no-op pans across several rAFs to force the buffer through.
    let kicks = 0;
    const tick = () => {
      if (!map) return;
      const c = map.getCenter();
      map.jumpTo({ center: [c.lng + 1e-9, c.lat], zoom: map.getZoom() });
      map.jumpTo({ center: [c.lng, c.lat], zoom: map.getZoom() });
      if (kicks++ < 30) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  cityMarkers.forEach((m) => m.remove());
  attractionMarkers.forEach((m) => m.remove());
  prefMarkers.forEach((m) => m.remove());
  stationMarkers.forEach((m) => m.remove());
  map?.remove();
  map = null;
});

// React to active city changes from outside (e.g. TopAppBar)
watch(
  () => store.activeCityId,
  (id) => {
    if (!id || !map) return;
    const city = CITIES.find((c) => c.id === id);
    if (!city) return;
    map.flyTo({ center: city.coord, zoom: 11, speed: 0.9 });
  },
);

watch(
  () => store.activeAttractionId,
  (id) => {
    if (!id || !map) return;
    const a = ATTRACTIONS.find((x) => x.id === id);
    if (!a) return;
    map.flyTo({ center: a.coord, zoom: Math.max(map.getZoom(), 12.5), speed: 0.9 });
  },
);

watch(
  () => store.activeDistrictId,
  (id) => {
    if (!id || !map) return;
    const d = DISTRICTS.find((x) => x.id === id);
    if (!d) return;
    map.flyTo({ center: d.labelCoord, zoom: 11.5, speed: 0.9 });
  },
);

function zoomIn() {
  map?.zoomIn();
}
function zoomOut() {
  map?.zoomOut();
}
function reset() {
  map?.flyTo({ center: KANSAI_CENTER, zoom: 8.4, speed: 1.1 });
  store.closeAll();
  store.activeCityId = null;
}
</script>

<template>
  <div class="absolute inset-0">
    <div ref="containerRef" class="absolute inset-0" />
    <!-- Soft warm vignette to keep edges from feeling flat -->
    <div
      class="pointer-events-none absolute inset-0"
      style="
        background: radial-gradient(
          ellipse at center,
          transparent 60%,
          rgba(122, 92, 56, 0.18) 100%
        );
      "
    />
    <MapControls @zoom-in="zoomIn" @zoom-out="zoomOut" @reset="reset" />
  </div>
</template>

<style>
.maplibregl-ctrl-bottom-right,
.maplibregl-ctrl-bottom-left {
  bottom: 70px !important;
}
</style>
