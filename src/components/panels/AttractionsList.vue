<script setup lang="ts">
import { computed } from 'vue';
import { useMapStore } from '@/stores/map';
import { DISTRICTS } from '@/data/districts';
import { playItamiChime, playKixChime } from '@/audio/chime';
import AttractionCard from './AttractionCard.vue';

const store = useMapStore();
const selectedDistrict = computed(() => store.activeDistrict);
const grouped = computed(() => {
  const cityId = store.activeCityId;
  if (!cityId) return [];
  const districts = DISTRICTS.filter((d) => d.cityId === cityId);
  return districts.map((d) => ({
    district: d,
    items: store.activeCityAttractions.filter((a) => a.districtId === d.id),
  }));
});

function selectAttraction(id: string) {
  store.selectAttraction(id);
  if (id === 'itami-airport') playItamiChime();
  // 神戶機場 borrows the KIX 4-note chime
  if (id === 'kobe-airport-attr') playKixChime();
}
</script>

<template>
  <div class="p-4">
    <p class="font-label text-[11px] tracking-widest text-ink-soft uppercase mb-3">
      Attractions
    </p>

    <template v-if="selectedDistrict">
      <h3
        class="font-epilogue font-bold text-base text-neon-pink mb-3 flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[18px]">place</span>
        {{ selectedDistrict.name_zh }}
      </h3>
      <div class="flex flex-col gap-2">
        <AttractionCard
          v-for="a in store.activeDistrictAttractions"
          :key="a.id"
          :attraction="a"
          :active="a.id === store.activeAttractionId"
          @click="selectAttraction"
        />
      </div>
    </template>

    <template v-else>
      <div v-for="g in grouped" :key="g.district.id" class="mb-5">
        <button
          class="w-full text-left flex items-center justify-between gap-2 px-1 py-1 mb-2"
          @click="store.selectDistrict(g.district.id)"
        >
          <h3 class="font-epilogue font-bold text-sm text-ink hover:text-neon-pink">
            {{ g.district.name_zh }}
          </h3>
          <span class="font-label text-[10px] tracking-widest text-ink-faint">
            {{ g.items.length }} SPOTS
          </span>
        </button>
        <div class="flex flex-col gap-2">
          <AttractionCard
            v-for="a in g.items"
            :key="a.id"
            :attraction="a"
            :active="a.id === store.activeAttractionId"
            @click="selectAttraction"
          />
        </div>
      </div>
    </template>
  </div>
</template>
