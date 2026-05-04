<script setup lang="ts">
import { computed } from 'vue';
import { useMapStore } from '@/stores/map';
import PhotoImage from '@/components/ui/PhotoImage.vue';
import NeonChip from '@/components/ui/NeonChip.vue';
import OsakaMotif from '@/components/ui/OsakaMotif.vue';
import type { CityId } from '@/types';

const store = useMapStore();
const city = computed(() => store.activeCity);
const district = computed(() => store.activeDistrict);
const attractionCount = computed(() => store.activeCityAttractions.length);
const districtCount = computed(() => store.cityDistricts.length);

const cityColor: Record<CityId, string> = {
  osaka: '#e63946',
  kyoto: '#b7295a',
  kobe: '#2a7da3',
  nara: '#6fbe3f',
  kix: '#ff7a00',
};

const cityMotif: Record<CityId, 'glico' | 'tsutenkaku' | 'lantern' | 'takoyaki' | 'octopus'> = {
  osaka: 'glico',
  kyoto: 'lantern',
  kobe: 'tsutenkaku',
  nara: 'takoyaki',
  kix: 'octopus',
};
</script>

<template>
  <div v-if="city" class="p-5">
    <div class="flex items-center gap-2">
      <span class="font-label text-[11px] tracking-widest text-ink-soft uppercase">
        Area Details
      </span>
      <span
        class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-label tracking-widest text-white"
        :style="{ background: cityColor[city.id] }"
      >
        {{ city.name_en }}
      </span>
    </div>
    <h2
      class="mt-2 font-epilogue font-extrabold text-2xl tracking-tight"
      :style="{ color: cityColor[city.id] }"
    >
      {{ city.name_zh }}
      <span class="text-ink-faint font-normal text-base ml-1"
        >· {{ city.name_jp }}</span
      >
    </h2>
    <p class="mt-1 text-sm text-ink-soft">{{ city.tagline }}</p>

    <div class="mt-4">
      <PhotoImage
        :src="city.heroPhoto"
        :alt="`${city.name_zh} 代表照`"
        ratio="16/9"
        rounded="xl"
      />
    </div>

    <div class="mt-4 grid grid-cols-2 gap-2">
      <div class="rounded-lg border border-line bg-paper-soft p-3">
        <p class="font-label text-[10px] tracking-widest text-ink-faint">
          DISTRICTS
        </p>
        <p class="font-epilogue font-extrabold text-2xl mt-1" :style="{ color: cityColor[city.id] }">
          {{ districtCount }}
        </p>
      </div>
      <div class="rounded-lg border border-line bg-paper-soft p-3">
        <p class="font-label text-[10px] tracking-widest text-ink-faint">
          ATTRACTIONS
        </p>
        <p class="font-epilogue font-extrabold text-2xl mt-1" :style="{ color: cityColor[city.id] }">
          {{ attractionCount }}
        </p>
      </div>
    </div>

    <div v-if="district" class="mt-5 pt-4 border-t border-line">
      <p class="font-label text-[11px] tracking-widest text-ink-soft uppercase">
        Selected District
      </p>
      <h3 class="font-epilogue font-bold text-lg text-ink mt-1">
        {{ district.name_zh }}
      </h3>
      <p class="text-sm text-ink-soft mt-1">{{ district.description }}</p>
      <button
        class="mt-3 inline-flex items-center gap-1 font-label text-xs tracking-widest text-neon-pink hover:underline"
        @click="store.setTab('attractions')"
      >
        <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
        VIEW ATTRACTIONS
      </button>
    </div>

    <div class="mt-5 flex items-center justify-between gap-3">
      <div class="flex flex-wrap gap-1.5">
        <NeonChip variant="pink">Kuidaore</NeonChip>
        <NeonChip variant="cyan">Photogenic</NeonChip>
        <NeonChip variant="green">Day Trip</NeonChip>
      </div>
      <OsakaMotif
        :kind="cityMotif[city.id]"
        :size="44"
        :color="cityColor[city.id]"
        class="shrink-0"
      />
    </div>
  </div>
</template>
