import type { City } from '@/types';

// Coordinates derived from real geography (PRD appendix B + kansaimap.jpg).
// [lng, lat]
export const CITIES: City[] = [
  {
    id: 'osaka',
    name_zh: '大阪',
    name_jp: '大阪',
    name_en: 'OSAKA',
    coord: [135.502, 34.694], // 梅田—難波 軸線中點
    iconSymbol: 'castle',
    themeColor: 'pink',
    tagline: '美食與娛樂之都',
    heroPhoto: '/photos/osaka/_hero.jpg',
  },
  {
    id: 'kyoto',
    name_zh: '京都',
    name_jp: '京都',
    name_en: 'KYOTO',
    coord: [135.768, 35.012],
    iconSymbol: 'temple_buddhist',
    themeColor: 'cyan',
    tagline: '古都文化核心',
    heroPhoto: '/photos/kyoto/_hero.jpg',
  },
  {
    id: 'kobe',
    name_zh: '神戶',
    name_jp: '神戸',
    name_en: 'KOBE',
    coord: [135.195, 34.690],
    iconSymbol: 'sailing',
    themeColor: 'cyan',
    tagline: '港風與歐式異國',
    heroPhoto: '/photos/kobe/_hero.jpg',
  },
  {
    id: 'nara',
    name_zh: '奈良',
    name_jp: '奈良',
    name_en: 'NARA',
    coord: [135.832, 34.685],
    iconSymbol: 'pets',
    themeColor: 'green',
    tagline: '與鹿共舞古蹟',
    heroPhoto: '/photos/nara/_hero.jpg',
  },
  {
    id: 'kix',
    name_zh: '關西機場',
    name_jp: '関西空港',
    name_en: 'KIX',
    coord: [135.244, 34.434],
    iconSymbol: 'flight',
    themeColor: 'cyan',
    tagline: '關西門戶',
    heroPhoto: '/photos/kix/_hero.jpg',
  },
];

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(
  CITIES.map((c) => [c.id, c]),
);
