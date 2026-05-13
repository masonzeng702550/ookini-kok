import { watch, onScopeDispose, type ShallowRef, type Ref } from 'vue';
import maplibregl, { Map as MlMap } from 'maplibre-gl';
import type { LngLat } from '@/types';

interface GlicoRunnerOptions {
  // ShallowRef so vue-tsc keeps the Map type nominal rather than expanding
  // it structurally through ref()'s deep unwrap.
  map: ShallowRef<MlMap | null>;
  coords: Ref<LngLat[] | null>;
  speedKmh?: number;
  loop?: boolean;
  playing: Ref<boolean>;
}

/**
 * Animates a stylized Osaka Glico runner marker along an itinerary polyline.
 * The marker advances at a constant apparent ground speed (km/h), rotating
 * (and flipping) to face the direction of travel. When the path completes,
 * it either loops back to the start or hides itself.
 */
export function useGlicoRunner(opts: GlicoRunnerOptions) {
  const speedKmh = opts.speedKmh ?? 4;
  const loop = opts.loop ?? true;

  // --- SVG runner element ------------------------------------------------
  // Hand-rolled silhouette: head with hair, red singlet, arms outstretched
  // mid-stride, legs mid-stride, small smile. Roughly 44 px tall.
  const SVG_MARKUP = `
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="48" viewBox="0 0 44 48" overflow="visible">
  <defs>
    <filter id="glico-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <g filter="url(#glico-shadow)">
    <!-- back leg (white track pant + red shoe) -->
    <path d="M18 30 L13 42 L9 42 L15 28 Z" fill="#ffffff" stroke="#1a1a1a" stroke-width="1" stroke-linejoin="round"/>
    <ellipse cx="11" cy="43" rx="3.2" ry="1.6" fill="#d31f2a" stroke="#1a1a1a" stroke-width="0.8"/>
    <!-- front leg kicked forward -->
    <path d="M22 28 L30 38 L34 36 L26 26 Z" fill="#ffffff" stroke="#1a1a1a" stroke-width="1" stroke-linejoin="round"/>
    <ellipse cx="33" cy="36.5" rx="3.4" ry="1.6" fill="#d31f2a" stroke="#1a1a1a" stroke-width="0.8"/>
    <!-- red singlet body -->
    <path d="M14 14 Q14 12 18 12 L26 12 Q30 12 30 14 L31 28 Q22 31 13 28 Z" fill="#d31f2a" stroke="#1a1a1a" stroke-width="1" stroke-linejoin="round"/>
    <!-- Glico wordmark stripe -->
    <rect x="16" y="18" width="12" height="3.2" fill="#ffffff"/>
    <text x="22" y="20.6" text-anchor="middle" font-family="Arial, sans-serif" font-size="3.2" font-weight="700" fill="#d31f2a">Glico</text>
    <!-- back arm swung behind -->
    <path d="M14 16 L6 22 L8 25 L15 20 Z" fill="#f3c9a6" stroke="#1a1a1a" stroke-width="0.9" stroke-linejoin="round"/>
    <!-- front arm thrust forward (the iconic pose) -->
    <path d="M30 16 L40 10 L42 13 L31 19 Z" fill="#f3c9a6" stroke="#1a1a1a" stroke-width="0.9" stroke-linejoin="round"/>
    <!-- head -->
    <circle cx="22" cy="7" r="5" fill="#f3c9a6" stroke="#1a1a1a" stroke-width="1"/>
    <!-- hair cap -->
    <path d="M17.2 6 Q17 2 22 2 Q27 2 26.8 6 Q24 4.5 22 4.5 Q20 4.5 17.2 6 Z" fill="#2a1a0e"/>
    <!-- smile -->
    <path d="M20.2 8.4 Q22 9.6 23.8 8.4" stroke="#1a1a1a" stroke-width="0.7" fill="none" stroke-linecap="round"/>
    <!-- eye dot -->
    <circle cx="24" cy="6.8" r="0.55" fill="#1a1a1a"/>
  </g>
</svg>`.trim();

  // Outer wrapper is positioned by MapLibre via translate3d on its style.
  // We never touch the outer transform. Rotation/flip is applied to an inner
  // div instead, so MapLibre's positioning and our rotation don't fight each
  // other (last-write-wins on style.transform).
  function makeRunnerEl(): { outer: HTMLDivElement; inner: HTMLDivElement } {
    const outer = document.createElement('div');
    outer.className = 'glico-runner';
    outer.style.width = '44px';
    outer.style.height = '48px';
    outer.style.pointerEvents = 'none';

    const inner = document.createElement('div');
    inner.style.width = '100%';
    inner.style.height = '100%';
    inner.style.willChange = 'transform';
    inner.style.transformOrigin = 'center center';
    inner.innerHTML = SVG_MARKUP;
    outer.appendChild(inner);
    return { outer, inner };
  }

  // --- Geo helpers -------------------------------------------------------
  const R_KM = 6371;
  function toRad(d: number) {
    return (d * Math.PI) / 180;
  }
  function haversineKm(a: LngLat, b: LngLat): number {
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  // --- State -------------------------------------------------------------
  let marker: maplibregl.Marker | null = null;
  let el: HTMLDivElement | null = null;
  let innerEl: HTMLDivElement | null = null;
  // setInterval (rather than rAF) so the runner keeps moving even in
  // headless/background contexts where browsers pause animation frames.
  // 33 ms ≈ 30 fps — plenty smooth for a mascot icon.
  const TICK_MS = 33;
  let intervalId: number | null = null;
  let lastTs: number | null = null;
  let segIndex = 0;
  let segProgressKm = 0;
  let segLengths: number[] = [];
  let activeCoords: LngLat[] = [];

  function ensureMarker(): maplibregl.Marker | null {
    const m = opts.map.value;
    if (!m) return null;
    if (!marker) {
      const made = makeRunnerEl();
      el = made.outer;
      innerEl = made.inner;
      marker = new maplibregl.Marker({ element: el, anchor: 'center' });
    }
    return marker;
  }

  function attachMarker() {
    const m = opts.map.value;
    const mk = ensureMarker();
    if (!m || !mk || !activeCoords.length) return;
    mk.setLngLat(activeCoords[0] as [number, number]).addTo(m);
    if (el) el.style.display = '';
  }

  function detachMarker() {
    if (marker) marker.remove();
  }

  function hide() {
    if (el) el.style.display = 'none';
  }

  function resetTraversal(coords: LngLat[]) {
    activeCoords = coords;
    segIndex = 0;
    segProgressKm = 0;
    segLengths = [];
    for (let i = 0; i < coords.length - 1; i++) {
      segLengths.push(haversineKm(coords[i], coords[i + 1]));
    }
  }

  function applyTransform(rotationDeg: number, flipX: boolean) {
    if (!innerEl) return;
    // Rotation: 0 = facing right (east). flipX mirrors for west travel.
    // Applied on the inner element so MapLibre's translate3d on the outer
    // wrapper isn't clobbered.
    const sx = flipX ? -1 : 1;
    innerEl.style.transform = `scaleX(${sx}) rotate(${rotationDeg}deg)`;
  }

  function step() {
    const ts = performance.now();
    if (!opts.playing.value) {
      lastTs = null;
      return;
    }
    const mk = ensureMarker();
    const mapInst = opts.map.value;
    if (!mk || !mapInst || activeCoords.length < 2) {
      lastTs = null;
      return;
    }
    if (lastTs == null) lastTs = ts;
    // Allow up to 0.5s of catch-up per tick so background-throttled timers
    // (browsers clamp setInterval to ~1s in hidden tabs) still advance the
    // runner visibly when they fire.
    const dtSec = Math.min(0.5, (ts - lastTs) / 1000);
    lastTs = ts;

    const advanceKm = (speedKmh / 3600) * dtSec;
    segProgressKm += advanceKm;

    // Walk forward across segments if we overshot.
    while (segIndex < segLengths.length && segProgressKm >= segLengths[segIndex]) {
      segProgressKm -= segLengths[segIndex];
      segIndex++;
    }

    if (segIndex >= segLengths.length) {
      // Reached the end.
      if (loop) {
        segIndex = 0;
        segProgressKm = 0;
      } else {
        // Snap to final point, hide, stop.
        const last = activeCoords[activeCoords.length - 1];
        mk.setLngLat(last as [number, number]);
        hide();
        lastTs = null;
        return;
      }
    }

    const a = activeCoords[segIndex];
    const b = activeCoords[segIndex + 1];
    const segLen = segLengths[segIndex] || 1e-9;
    const t = Math.min(1, segProgressKm / segLen);
    const lng = lerp(a[0], b[0], t);
    const lat = lerp(a[1], b[1], t);
    mk.setLngLat([lng, lat]);

    // Heading in screen space (approx, using equirectangular scaling).
    const latScale = Math.cos(toRad((a[1] + b[1]) / 2));
    const dx = (b[0] - a[0]) * latScale;
    const dy = b[1] - a[1];
    // Image natively faces right. Rotation around screen up (north).
    // atan2(-dy, dx) → angle from east, with north positive screen-up.
    let angle = (Math.atan2(-dy, dx) * 180) / Math.PI;
    let flipX = false;
    // Keep runner upright: if facing leftward, mirror and clamp rotation.
    if (angle > 90 || angle < -90) {
      flipX = true;
      // Mirror angle around the vertical axis so a slight up-left tilt
      // remains a slight up-left tilt after the flip.
      angle = 180 - angle;
      if (angle > 180) angle -= 360;
    }
    // Clamp to a gentle tilt for up/down legs so the runner doesn't somersault.
    const tilt = Math.max(-25, Math.min(25, angle));
    applyTransform(tilt, flipX);
  }

  function startLoop() {
    if (intervalId != null) return;
    if (!opts.playing.value) return;
    if (activeCoords.length < 2) return;
    lastTs = null;
    intervalId = window.setInterval(step, TICK_MS);
  }

  function stopLoop() {
    if (intervalId != null) window.clearInterval(intervalId);
    intervalId = null;
    lastTs = null;
  }

  // --- Watchers ----------------------------------------------------------
  watch(
    () => opts.map.value,
    (m) => {
      if (!m) {
        stopLoop();
        detachMarker();
        marker = null;
        el = null;
        innerEl = null;
      } else if (activeCoords.length >= 2) {
        attachMarker();
        startLoop();
      }
    },
    { immediate: true },
  );

  watch(
    () => opts.coords.value,
    (c) => {
      stopLoop();
      if (!c || c.length < 2) {
        activeCoords = [];
        hide();
        return;
      }
      resetTraversal(c);
      attachMarker();
      startLoop();
    },
    { immediate: true },
  );

  watch(
    () => opts.playing.value,
    (p) => {
      if (p) startLoop();
      else stopLoop();
    },
  );

  // --- Cleanup -----------------------------------------------------------
  onScopeDispose(() => {
    stopLoop();
    detachMarker();
    marker = null;
    el = null;
    innerEl = null;
  });
}
