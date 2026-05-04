import { defineStore } from 'pinia';
import { CITIES, CITY_BY_ID } from '@/data/cities';
import { DISTRICTS, DISTRICT_BY_ID } from '@/data/districts';
import { ATTRACTIONS } from '@/data/attractions';
import { RAILWAY_BY_ID } from '@/data/railways';
import type { CityId, DrawerTab, ZoomLevel } from '@/types';

interface State {
  activeTab: DrawerTab;
  activeCityId: CityId | null;
  activeDistrictId: string | null;
  activeRailwayId: string | null;
  activeAttractionId: string | null;
  zoomLevel: ZoomLevel;
  drawerOpen: boolean;
}

export const useMapStore = defineStore('map', {
  state: (): State => ({
    activeTab: 'area',
    activeCityId: 'osaka',
    activeDistrictId: null,
    activeRailwayId: null,
    activeAttractionId: null,
    zoomLevel: 'overview',
    drawerOpen: true,
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
      this.activeTab = 'railways';
      this.drawerOpen = true;
    },
    selectAttraction(id: string) {
      this.activeAttractionId = id;
      this.activeTab = 'attractions';
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
    },
  },
});
