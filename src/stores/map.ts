import { defineStore } from 'pinia';
import { CITIES, CITY_BY_ID } from '@/data/cities';
import { DISTRICTS, DISTRICT_BY_ID } from '@/data/districts';
import { ATTRACTIONS } from '@/data/attractions';
import { RAILWAY_BY_ID } from '@/data/railways';
import { STATIONS } from '@/data/stations';
import type { CityId, DrawerTab, Itinerary, ZoomLevel } from '@/types';

interface State {
  activeTab: DrawerTab;
  activeCityId: CityId | null;
  activeDistrictId: string | null;
  activeRailwayId: string | null;
  activeAttractionId: string | null;
  activeStationId: string | null;
  zoomLevel: ZoomLevel;
  drawerOpen: boolean;
  itinerary: Itinerary | null;
  /** Attractions the user has shortlisted for itinerary planning. */
  selectedIds: string[];
  /** Attractions the user has favorited (heart-tapped). Persisted. */
  favoriteIds: string[];
}

const FAV_KEY = 'okini-favorites';

function readFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  } catch {
    /* quota exceeded or private-mode — fail silently */
  }
}

export const useMapStore = defineStore('map', {
  state: (): State => ({
    activeTab: 'area',
    activeCityId: 'osaka',
    activeDistrictId: null,
    activeRailwayId: null,
    activeAttractionId: null,
    activeStationId: null,
    zoomLevel: 'overview',
    drawerOpen: true,
    itinerary: null,
    selectedIds: [],
    favoriteIds: readFavorites(),
  }),
  getters: {
    cities: () => CITIES,
    activeCity: (s) => (s.activeCityId ? CITY_BY_ID[s.activeCityId] : null),
    activeDistrict: (s) =>
      s.activeDistrictId ? DISTRICT_BY_ID[s.activeDistrictId] : null,
    activeRailway: (s) =>
      s.activeRailwayId ? RAILWAY_BY_ID[s.activeRailwayId] : null,
    activeAttraction: (s) =>
      ATTRACTIONS.find((a) => a.id === s.activeAttractionId) ?? null,
    activeStation: (s) =>
      STATIONS.find((st) => st.id === s.activeStationId) ?? null,

    activeCityAttractions: (s) =>
      s.activeCityId ? ATTRACTIONS.filter((a) => a.cityId === s.activeCityId) : [],

    activeDistrictAttractions: (s) =>
      s.activeDistrictId
        ? ATTRACTIONS.filter((a) => a.districtId === s.activeDistrictId)
        : [],

    cityDistricts: (s) =>
      s.activeCityId ? DISTRICTS.filter((d) => d.cityId === s.activeCityId) : [],
  },
  actions: {
    selectCity(id: CityId) {
      this.activeCityId = id;
      this.activeDistrictId = null;
      this.activeRailwayId = null;
      this.activeAttractionId = null;
      this.activeTab = 'area';
      this.drawerOpen = true;
    },
    selectDistrict(id: string) {
      this.activeDistrictId = id;
      this.activeRailwayId = null;
      this.activeAttractionId = null;
      this.activeTab = 'attractions';
      this.drawerOpen = true;
    },
    selectRailway(id: string) {
      this.activeRailwayId = id;
      this.activeDistrictId = null;
      this.activeAttractionId = null;
      this.activeStationId = null;
      this.activeTab = 'railways';
      this.drawerOpen = true;
    },
    selectAttraction(id: string) {
      this.activeAttractionId = id;
      this.activeTab = 'attractions';
      this.drawerOpen = true;
    },
    selectStation(id: string) {
      // Clicking a station shows transfer-line info, not area info.
      this.activeStationId = id;
      this.activeRailwayId = null;
      this.activeDistrictId = null;
      this.activeAttractionId = null;
      this.activeTab = 'railways';
      this.drawerOpen = true;
    },
    setTab(tab: DrawerTab) {
      this.activeTab = tab;
    },
    setZoomLevel(z: ZoomLevel) {
      this.zoomLevel = z;
    },
    toggleDrawer(force?: boolean) {
      this.drawerOpen = force ?? !this.drawerOpen;
    },
    closeAll() {
      this.activeDistrictId = null;
      this.activeRailwayId = null;
      this.activeAttractionId = null;
      this.activeStationId = null;
    },
    toggleSelected(id: string) {
      const idx = this.selectedIds.indexOf(id);
      if (idx >= 0) this.selectedIds.splice(idx, 1);
      else this.selectedIds.push(id);
    },
    clearSelected() {
      this.selectedIds = [];
    },
    setItinerary(it: Itinerary | null) {
      this.itinerary = it;
    },
    toggleFavorite(id: string) {
      const idx = this.favoriteIds.indexOf(id);
      if (idx >= 0) this.favoriteIds.splice(idx, 1);
      else this.favoriteIds.push(id);
      writeFavorites(this.favoriteIds);
    },
    isFavorite(id: string): boolean {
      return this.favoriteIds.includes(id);
    },
  },
});
