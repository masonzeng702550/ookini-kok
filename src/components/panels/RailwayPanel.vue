<script setup lang="ts">
import { computed } from 'vue';
import { useMapStore } from '@/stores/map';
import { RAILWAYS } from '@/data/railways';
import { playMidosujiChime } from '@/audio/chime';

const store = useMapStore();
const station = computed(() => store.activeStation);
const railway = computed(() => store.activeRailway);

function selectRailway(id: string) {
  store.selectRailway(id);
  // All Osaka Metro lines share the same e.piano chime (Midosuji-style)
  if (id.startsWith('osaka-metro-')) playMidosujiChime();
}

// Map a station's display line label to an actual railway entry (fuzzy
// match) so users can drill into the full line detail from the transfer
// list. Returns null when no good match is found.
function matchRailway(lineLabel: string) {
  const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  const target = norm(lineLabel);
  // Try: exact, substring, then shared keyword
  return (
    RAILWAYS.find((r) => norm(r.name_zh) === target) ||
    RAILWAYS.find(
      (r) => target.includes(norm(r.name_zh)) || norm(r.name_zh).includes(target),
    ) ||
    null
  );
}

function clickTransferLine(label: string) {
  const r = matchRailway(label);
  if (r) {
    selectRailway(r.id);
  }
}
</script>

<template>
  <div class="p-4">
    <p class="font-label text-[11px] tracking-widest text-ink-soft uppercase mb-3">
      {{ station ? 'Station Transfers' : 'Railways' }}
    </p>

    <!-- Station transfer view ------------------------------------------- -->
    <div
      v-if="station"
      class="rounded-xl border border-line bg-paper-soft p-4"
    >
      <div class="flex items-center gap-3">
        <span
          class="w-3 h-3 rounded-full"
          :style="{
            backgroundColor: station.primaryColor,
            boxShadow: `0 0 8px ${station.primaryColor}88`
          }"
        ></span>
        <h3 class="font-epilogue font-bold text-lg text-ink">
          {{ station.name_zh }}
        </h3>
        <span
          class="ml-auto px-2 py-0.5 rounded-full text-[10px] font-label tracking-widest text-white"
          :style="{ background: station.primaryColor }"
        >
          {{ station.kind === 'hub' ? 'HUB' : 'TERMINUS' }}
        </span>
      </div>
      <p
        v-if="station.name_jp"
        class="font-label text-[11px] tracking-widest text-ink-faint mt-1"
      >
        {{ station.name_jp }}
      </p>

      <div class="mt-3">
        <p class="font-label text-[10px] tracking-widest text-ink-faint mb-1.5">
          TRANSFER LINES ({{ station.lines.length }})
        </p>
        <div class="flex flex-col gap-1.5">
          <button
            v-for="(line, i) in station.lines"
            :key="i"
            class="flex items-center gap-3 p-2 rounded-lg border border-line bg-paper hover:bg-paper-warm hover:border-neon-pink/40 transition text-left"
            @click="clickTransferLine(line)"
          >
            <span
              class="w-2 h-6 rounded-sm shrink-0"
              :style="{
                backgroundColor: matchRailway(line)?.color ?? station.primaryColor,
                boxShadow: `0 0 4px ${matchRailway(line)?.color ?? station.primaryColor}88`
              }"
            ></span>
            <span class="flex-1 min-w-0 font-body text-sm text-ink truncate">
              {{ line }}
            </span>
            <span
              v-if="matchRailway(line)"
              class="material-symbols-outlined text-ink-faint text-[16px]"
              >chevron_right</span
            >
          </button>
        </div>
      </div>

      <button
        class="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-full font-label tracking-widest text-[11px] uppercase border border-line text-ink-soft hover:bg-paper-warm transition"
        @click="store.activeStationId = null"
      >
        <span class="material-symbols-outlined text-[14px]">close</span>
        關閉車站資訊
      </button>
    </div>

    <!-- Railway detail view --------------------------------------------- -->
    <div
      v-else-if="railway"
      class="rounded-xl border border-line bg-paper-soft p-4"
    >
      <div class="flex items-center gap-3">
        <span
          class="w-3 h-3 rounded-full"
          :style="{
            backgroundColor: railway.color,
            boxShadow: `0 0 8px ${railway.color}88`
          }"
        ></span>
        <h3 class="font-epilogue font-bold text-lg text-ink">
          {{ railway.name_zh }}
        </h3>
      </div>
      <p class="font-label text-[11px] tracking-widest text-ink-faint mt-1">
        {{ railway.operator }} · {{ railway.name_jp }}
      </p>

      <div class="mt-3">
        <p class="font-label text-[10px] tracking-widest text-ink-faint mb-1.5">
          TRAIN TYPES
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="t in railway.trainTypes"
            :key="t"
            class="px-2 py-0.5 text-xs rounded-full border border-line bg-paper text-ink-soft"
          >
            {{ t }}
          </span>
        </div>
      </div>

      <div class="mt-3">
        <p class="font-label text-[10px] tracking-widest text-ink-faint mb-1.5">
          MAJOR STATIONS
        </p>
        <ol
          class="relative ml-3 border-l border-dashed pl-4 space-y-2"
          :style="{ borderColor: railway.color + '99' }"
        >
          <li
            v-for="(s, i) in railway.stations"
            :key="i"
            class="text-sm text-ink relative"
          >
            <span
              class="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full"
              :style="{ backgroundColor: railway.color }"
            ></span>
            {{ s.name_zh }}
          </li>
        </ol>
      </div>

      <a
        :href="railway.scheduleUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-full font-label tracking-widest text-xs uppercase bg-neon-pink text-white shadow-neon-pink hover:scale-[1.02] active:scale-95 transition"
      >
        <span class="material-symbols-outlined text-[18px]">schedule</span>
        前往官方時刻表
        <span class="material-symbols-outlined text-[18px]">open_in_new</span>
      </a>
    </div>

    <!-- Default list ----------------------------------------------------- -->
    <div v-else class="flex flex-col gap-1.5">
      <p class="text-xs text-ink-soft mb-2">
        點擊地圖上鐵路線、車站、或從下方列表選擇：
      </p>
      <button
        v-for="r in RAILWAYS"
        :key="r.id"
        class="flex items-center gap-3 p-2.5 rounded-lg border border-line bg-paper-soft hover:bg-paper-warm hover:border-neon-pink/40 transition text-left"
        @click="selectRailway(r.id)"
      >
        <span
          class="w-2.5 h-8 rounded-sm"
          :style="{
            backgroundColor: r.color,
            boxShadow: `0 0 6px ${r.color}99`
          }"
        ></span>
        <span class="flex-1 min-w-0">
          <span class="block font-epilogue text-sm text-ink truncate">
            {{ r.name_zh }}
          </span>
          <span
            class="block font-label text-[10px] tracking-widest text-ink-faint truncate"
          >
            {{ r.operator }}
          </span>
        </span>
        <span class="material-symbols-outlined text-ink-faint text-[18px]"
          >chevron_right</span
        >
      </button>
    </div>
  </div>
</template>
