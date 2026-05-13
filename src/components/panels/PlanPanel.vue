<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMapStore } from '@/stores/map';
import { ATTRACTIONS, ATTRACTION_BY_ID } from '@/data/attractions';
import { CITIES } from '@/data/cities';
import { planItinerary, recommendItinerary } from '@/data/planner';
import { RAILWAY_BY_ID } from '@/data/railways';
import PlanPrefsCard from './PlanPrefsCard.vue';
import PlanSurpriseButton from './PlanSurpriseButton.vue';
import PlanShareBar from './PlanShareBar.vue';
import PlanEconomicsCard from './PlanEconomicsCard.vue';
import type { CityId, CommuteSegment, PlannerPrefs } from '@/types';

const store = useMapStore();

const dayCount = ref<number>(3);
const selectedRegions = ref<CityId[]>(['osaka', 'kyoto']);
const prefs = ref<PlannerPrefs>({
  theme: 'mix',
  excludedTags: [],
  maxWalkKm: 8,
  startTime: '08:30',
});

const REGION_LABEL: Record<CityId, string> = {
  osaka: '大阪',
  kyoto: '京都',
  kobe: '神戶',
  nara: '奈良',
  kix: '關西機場',
};

function toggleRegion(c: CityId) {
  const i = selectedRegions.value.indexOf(c);
  if (i >= 0) selectedRegions.value.splice(i, 1);
  else selectedRegions.value.push(c);
}

const groupedAttractions = computed(() => {
  const groups: Record<CityId, typeof ATTRACTIONS> = {
    osaka: [], kyoto: [], kobe: [], nara: [], kix: [],
  };
  for (const a of ATTRACTIONS) {
    if ((a.duration ?? 0) <= 0) continue;
    groups[a.cityId].push(a);
  }
  return groups;
});

function generateManual() {
  if (store.selectedIds.length === 0) return;
  store.setItinerary(planItinerary(store.selectedIds, dayCount.value));
}

function generateRecommend() {
  if (selectedRegions.value.length === 0) return;
  store.setItinerary(
    recommendItinerary(selectedRegions.value, dayCount.value, prefs.value),
  );
}

function clearPlan() {
  store.setItinerary(null);
}

function formatMinutes(m: number): string {
  const total = Math.round(m);
  if (total < 60) return `${total} 分`;
  const h = Math.floor(total / 60);
  const min = total % 60;
  return min === 0 ? `${h} 小時` : `${h} 小時 ${min} 分`;
}

function segColor(seg: CommuteSegment): string {
  if (seg.mode === 'train' && seg.railwayId) {
    return RAILWAY_BY_ID[seg.railwayId]?.color ?? '#888';
  }
  if (seg.mode === 'walk') return '#a89683';
  return '#d49142'; // transfer
}

function segIcon(seg: CommuteSegment): string {
  if (seg.mode === 'train') return 'train';
  if (seg.mode === 'walk') return 'directions_walk';
  return 'sync_alt';
}

const itinerary = computed(() => store.itinerary);
</script>

<template>
  <section class="px-4 py-4 space-y-4">
    <header>
      <h2 class="font-display text-xl font-extrabold tracking-tight text-ink">
        行程規劃
      </h2>
      <p class="font-label text-[10px] tracking-widest text-ink-faint uppercase mt-0.5">
        Itinerary Planner
      </p>
    </header>

    <!-- Day picker -->
    <div>
      <label class="font-label text-[10px] tracking-widest text-ink-soft uppercase">
        天數
      </label>
      <div class="flex gap-1.5 mt-1.5">
        <button
          v-for="n in [1, 2, 3, 4, 5]"
          :key="n"
          class="flex-1 py-2 rounded-lg border text-sm font-bold transition"
          :class="
            dayCount === n
              ? 'bg-neon-pink text-white border-neon-pink'
              : 'bg-paper-soft border-line text-ink hover:bg-paper'
          "
          @click="dayCount = n"
        >
          {{ n }}
        </button>
      </div>
    </div>

    <!-- Region picker -->
    <div>
      <label class="font-label text-[10px] tracking-widest text-ink-soft uppercase">
        區域（推薦模式用）
      </label>
      <div class="flex flex-wrap gap-1.5 mt-1.5">
        <button
          v-for="c in CITIES"
          :key="c.id"
          class="px-2.5 py-1.5 rounded-full text-xs font-bold border transition"
          :class="
            selectedRegions.includes(c.id)
              ? 'bg-neon-cyan/15 border-neon-cyan text-ink'
              : 'bg-paper-soft border-line text-ink-soft hover:bg-paper'
          "
          @click="toggleRegion(c.id)"
        >
          {{ REGION_LABEL[c.id] }}
        </button>
      </div>
    </div>

    <!-- Preferences card -->
    <PlanPrefsCard v-model="prefs" />

    <button
      class="w-full py-2.5 rounded-lg bg-neon-cyan text-ink font-bold text-sm hover:opacity-90 transition"
      @click="generateRecommend"
    >
      <span class="material-symbols-outlined filled align-middle text-[18px] mr-1">auto_awesome</span>
      自動推薦行程
    </button>

    <PlanSurpriseButton :day-count="dayCount" />

    <!-- Manual select -->
    <details class="border border-line rounded-lg bg-paper-soft" open>
      <summary class="px-3 py-2.5 cursor-pointer font-bold text-sm flex justify-between">
        <span>挑選景點 ({{ store.selectedIds.length }})</span>
        <button
          v-if="store.selectedIds.length > 0"
          class="text-xs font-normal text-ink-soft hover:text-ink"
          @click.prevent="store.clearSelected()"
        >
          清除
        </button>
      </summary>
      <div class="px-2 pb-2 max-h-60 overflow-y-auto">
        <div v-for="city in CITIES" :key="city.id" class="mb-2">
          <div class="font-label text-[10px] tracking-widest text-ink-faint uppercase px-1 py-1">
            {{ REGION_LABEL[city.id] }}
          </div>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="a in groupedAttractions[city.id]"
              :key="a.id"
              class="px-2 py-1 rounded text-xs border transition"
              :class="
                store.selectedIds.includes(a.id)
                  ? 'bg-neon-pink/15 border-neon-pink text-ink'
                  : 'bg-white border-line text-ink-soft hover:bg-paper-soft'
              "
              @click="store.toggleSelected(a.id)"
            >
              {{ a.name_zh }}
              <span class="text-[9px] text-ink-faint ml-0.5">{{ a.duration }}m</span>
            </button>
          </div>
        </div>
      </div>
    </details>

    <button
      class="w-full py-2.5 rounded-lg bg-neon-pink text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-40"
      :disabled="store.selectedIds.length === 0"
      @click="generateManual"
    >
      <span class="material-symbols-outlined filled align-middle text-[18px] mr-1">route</span>
      用選定景點安排
    </button>

    <!-- Result -->
    <div v-if="itinerary" class="space-y-3 pt-2 border-t border-line">
      <div class="flex justify-between items-center gap-2">
        <h3 class="font-display text-base font-extrabold flex-1">行程結果</h3>
        <PlanShareBar :itinerary="itinerary" />
        <button
          class="text-xs text-ink-soft hover:text-ink ml-1"
          @click="clearPlan"
        >
          清除
        </button>
      </div>

      <!-- Cost / walking / pass summary -->
      <PlanEconomicsCard :itinerary="itinerary" />

      <div
        v-for="day in itinerary.days"
        :key="day.dayIndex"
        class="border border-line rounded-lg bg-white overflow-hidden"
      >
        <div class="px-3 py-2 bg-paper-soft border-b border-line flex justify-between items-center">
          <div class="font-bold text-sm">
            Day {{ day.dayIndex + 1 }}
          </div>
          <div class="font-label text-[10px] tracking-widest text-ink-soft">
            停留 {{ formatMinutes(day.stayMinutes) }} ·
            通勤 {{ formatMinutes(day.commuteMinutes) }}
          </div>
        </div>

        <ol class="divide-y divide-line/60">
          <li
            v-for="(stop, idx) in day.stops"
            :key="stop.attractionId"
            class="px-3 py-2.5"
          >
            <!-- Commute from previous stop -->
            <div
              v-if="stop.commute && idx > 0"
              class="mb-2 ml-2 pl-3 border-l-2 border-line/60 space-y-1"
            >
              <div
                v-for="(seg, si) in stop.commute.segments"
                :key="si"
                class="flex items-center gap-1.5 text-[11px] text-ink-soft"
              >
                <span
                  class="material-symbols-outlined text-[14px] filled"
                  :style="`color: ${segColor(seg)};`"
                >{{ segIcon(seg) }}</span>
                <span>{{ seg.label }}</span>
              </div>
              <div class="text-[10px] text-ink-faint pl-5">
                合計 {{ formatMinutes(stop.commute.totalMinutes) }}
              </div>
            </div>

            <!-- The stop itself -->
            <button
              class="flex items-start gap-2 text-left w-full hover:opacity-80"
              @click="store.selectAttraction(stop.attractionId)"
            >
              <span
                class="material-symbols-outlined filled mt-0.5 text-[18px]"
                :style="`color: ${
                  ATTRACTION_BY_ID[stop.attractionId]?.cityId === 'kyoto' ? '#b7295a' :
                  ATTRACTION_BY_ID[stop.attractionId]?.cityId === 'kobe' ? '#2a7da3' :
                  ATTRACTION_BY_ID[stop.attractionId]?.cityId === 'nara' ? '#6fbe3f' :
                  ATTRACTION_BY_ID[stop.attractionId]?.cityId === 'kix' ? '#ff7a00' :
                  '#e63946'
                };`"
              >{{ ATTRACTION_BY_ID[stop.attractionId]?.iconSymbol }}</span>
              <span class="flex-1">
                <div class="font-bold text-sm text-ink leading-tight">
                  {{ ATTRACTION_BY_ID[stop.attractionId]?.name_zh }}
                </div>
                <div class="text-[11px] text-ink-soft">
                  停留 {{ formatMinutes(stop.stayMinutes) }}
                </div>
              </span>
            </button>
          </li>
        </ol>
      </div>

      <p class="text-[11px] text-ink-faint leading-relaxed">
        通勤時間以平均車速、平均等車時間估算，實際以官方時刻表為準。
      </p>
    </div>
  </section>
</template>
