export type LngLat = [number, number];

export type CityId = 'osaka' | 'kyoto' | 'kobe' | 'nara' | 'kix';
export type ThemeColor = 'pink' | 'cyan' | 'green' | 'orange';

export interface City {
  id: CityId;
  name_zh: string;
  name_jp: string;
  name_en: string;
  coord: LngLat;
  iconSymbol: string;
  themeColor: ThemeColor;
  tagline: string;
  heroPhoto: string;
}

export interface District {
  id: string;
  cityId: CityId;
  name_zh: string;
  description: string;
  bounds: LngLat[]; // GeoJSON polygon ring (open; we close in code)
  labelCoord: LngLat;
}

export type AttractionTag = 'top-rated' | 'spicy' | 'open-now' | 'family' | 'photogenic';

export interface Attraction {
  id: string;
  districtId: string;
  cityId: CityId;
  name_zh: string;
  name_jp?: string;
  coord: LngLat;
  shortDesc: string;
  iconSymbol: string;
  photo: PhotoMeta;
  tags?: AttractionTag[];
  nearestStation?: string;
  /** Typical visit duration in minutes. Auto-filled from DURATIONS map. */
  duration: number;
}

export interface PhotoMeta {
  thumb: string;
  full: string;
  alt: string;
  credit: string;
  licenseUrl?: string;
}

export type Operator =
  | 'JR西日本'
  | '阪急電鐵'
  | '阪神電鐵'
  | '京阪電鐵'
  | '近畿日本鐵道'
  | '南海電鐵'
  | '神戶電鐵'
  | '山陽電鐵'
  | '北神急行'
  | '大阪Metro'
  | '京都市交通局'
  | '神戶市營地下鐵'
  | '叡山電車'
  | '京福電車'
  | '大阪單軌';

export interface Station {
  name_zh: string;
  coord: LngLat;
}

export interface Railway {
  id: string;
  name_zh: string;
  name_jp: string;
  operator: Operator;
  color: string;
  path: LngLat[];
  stations: Station[];
  trainTypes: string[];
  scheduleUrl: string;
}

export type ZoomLevel = 'overview' | 'district' | 'detail';
export type DrawerTab = 'area' | 'attractions' | 'railways' | 'food' | 'favorites';

export type StationKind = 'hub' | 'terminus';

export interface MapStation {
  id: string;
  name_zh: string;
  name_jp?: string;
  coord: LngLat;
  kind: StationKind;
  lines: string[];          // human-readable line names; first one is shown for color cue
  primaryColor: string;     // dominant railway color for marker tint
}
