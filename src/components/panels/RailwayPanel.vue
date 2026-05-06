<script setup lang="ts">
import { computed } from 'vue';
import { useMapStore } from '@/stores/map';
import { RAILWAYS } from '@/data/railways';
import { playMidosujiChime } from '@/audio/chime';

const store = useMapStore();
const railway = computed(() => store.activeRailway);

function selectRailway(id: string) {
  store.selectRailway(id);
  // All Osaka Metro lines share the same e.piano chime (Midosuji-style)
  if (id.startsWith('osaka-metro-')) playMidosujiChime();
}
</script>

<template>
  <div class="p-4">
    <p class="font-label text-[11px] tracking-widest text-ink-soft uppercase mb-3">
      Railways
    </p>

    <div
      v-if="railway"
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

    <div v-else class="flex flex-col gap-1.5">
      <p class="text-xs text-ink-soft mb-2">
        點擊地圖上鐵路線、或從下方列表選擇：
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
