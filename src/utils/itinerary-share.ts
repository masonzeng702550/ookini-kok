import type { CityId, Itinerary } from '@/types';
import { planItinerary, recommendItinerary } from '@/data/planner';
import { useMapStore } from '@/stores/map';

interface ShareMeta {
  selectedIds: string[];
  dayCount: number;
  regions: CityId[];
  mode: 'manual' | 'recommend';
}

function toBase64Url(input: string): string {
  // Encode as UTF-8 safe base64, then convert to base64url
  const b64 = btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return decodeURIComponent(escape(atob(b64)));
}

export function encodeItineraryToHash(it: Itinerary | null): string {
  if (!it) return '';
  const meta: ShareMeta = {
    selectedIds: it.meta.selectedIds,
    dayCount: it.meta.dayCount,
    regions: it.meta.regions,
    mode: it.meta.mode,
  };
  return toBase64Url(JSON.stringify(meta));
}

export function decodeItineraryFromHash(hash: string): ShareMeta | null {
  try {
    let h = hash;
    if (h.startsWith('#')) h = h.slice(1);
    if (h.startsWith('plan=')) h = h.slice('plan='.length);
    if (!h) return null;
    const json = fromBase64Url(h);
    const parsed = JSON.parse(json);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.selectedIds) ||
      typeof parsed.dayCount !== 'number' ||
      !Array.isArray(parsed.regions) ||
      (parsed.mode !== 'manual' && parsed.mode !== 'recommend')
    ) {
      return null;
    }
    return {
      selectedIds: parsed.selectedIds.map((s: unknown) => String(s)),
      dayCount: parsed.dayCount,
      regions: parsed.regions as CityId[],
      mode: parsed.mode,
    };
  } catch {
    return null;
  }
}

export function applyShareHashOnLoad(): void {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash;
  if (!hash || !hash.includes('plan=')) return;
  const decoded = decodeItineraryFromHash(hash);
  if (!decoded) return;
  const store = useMapStore();
  const it =
    decoded.mode === 'recommend'
      ? recommendItinerary(decoded.regions, decoded.dayCount)
      : planItinerary(decoded.selectedIds, decoded.dayCount);
  store.setItinerary(it);
}

export function buildShareUrl(it: Itinerary | null): string {
  const encoded = encodeItineraryToHash(it);
  const base =
    typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname
      : '';
  return encoded ? `${base}#plan=${encoded}` : base;
}
