<script setup lang="ts">
import { computed } from 'vue';
import type { Itinerary } from '@/types';
import { ATTRACTION_BY_ID } from '@/data/attractions';

const props = defineProps<{ itinerary: Itinerary | null }>();

const REGION_LABEL: Record<string, string> = {
  osaka: '大阪',
  kyoto: '京都',
  kobe: '神戶',
  nara: '奈良',
  kix: '關西機場',
};

function formatMinutes(m: number): string {
  const total = Math.round(m);
  if (total < 60) return `${total} 分`;
  const h = Math.floor(total / 60);
  const min = total % 60;
  return min === 0 ? `${h} 小時` : `${h} 小時 ${min} 分`;
}

const regionsLabel = computed(() => {
  if (!props.itinerary) return '';
  return props.itinerary.meta.regions
    .map((r) => REGION_LABEL[r] ?? r)
    .join('・');
});
</script>

<template>
  <div class="print-itinerary-root" aria-hidden="true">
    <header class="print-header">
      <div class="print-header-title">おおきに KOK！ 行程規劃</div>
      <div class="print-header-sub">
        Kansai Itinerary
        <template v-if="itinerary">
          · {{ itinerary.days.length }} 天<template v-if="regionsLabel">
            · {{ regionsLabel }}</template>
        </template>
      </div>
    </header>

    <div v-if="!itinerary" class="print-empty">尚未產生行程。</div>

    <section
      v-for="day in itinerary?.days ?? []"
      :key="day.dayIndex"
      class="print-day"
    >
      <div class="print-day-title">Day {{ day.dayIndex + 1 }}</div>
      <div class="print-day-meta">
        停留 {{ formatMinutes(day.stayMinutes) }} · 通勤
        {{ formatMinutes(day.commuteMinutes) }}
      </div>

      <ol>
        <template v-for="(stop, idx) in day.stops" :key="stop.attractionId">
          <div
            v-if="stop.commute && idx > 0"
            class="print-commute"
          >
            <div v-for="(seg, si) in stop.commute.segments" :key="si">
              · {{ seg.label }}
            </div>
            <div>合計 {{ formatMinutes(stop.commute.totalMinutes) }}</div>
          </div>
          <li class="print-stop">
            <div class="print-stop-name">
              {{ idx + 1 }}.
              {{ ATTRACTION_BY_ID[stop.attractionId]?.name_zh ?? stop.attractionId }}
            </div>
            <div class="print-stop-meta">
              停留 {{ formatMinutes(stop.stayMinutes) }}
            </div>
          </li>
        </template>
      </ol>
    </section>
  </div>
</template>

<style scoped>
/* Offscreen by default — only visible during print (see print.css). */
.print-itinerary-root {
  position: fixed;
  left: -9999px;
  top: 0;
  width: 210mm;
  pointer-events: none;
}
</style>
