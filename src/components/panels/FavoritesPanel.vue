<script setup lang="ts">
import { computed } from 'vue';
import { useMapStore } from '@/stores/map';
import { ATTRACTION_BY_ID } from '@/data/attractions';
import { CITIES } from '@/data/cities';
import AttractionCard from './AttractionCard.vue';
import OsakaMotif from '@/components/ui/OsakaMotif.vue';
import type { Attraction, CityId } from '@/types';

const store = useMapStore();

const REGION_LABEL: Record<CityId, string> = {
  osaka: '大阪',
  kyoto: '京都',
  kobe: '神戶',
  nara: '奈良',
  kix: '關西機場',
};

// Group favorites by city for cleaner visual grouping.
const grouped = computed(() => {
  const out: Partial<Record<CityId, Attraction[]>> = {};
  for (const id of store.favoriteIds) {
    const a = ATTRACTION_BY_ID[id];
    if (!a) continue;
    (out[a.cityId] = out[a.cityId] ?? []).push(a);
  }
  return out;
});

const totalCount = computed(() => store.favoriteIds.length);
</script>

<template>
  <section class="px-4 py-4">
    <header class="mb-3">
      <h2 class="font-display text-xl font-extrabold tracking-tight text-ink">
        我的收藏
      </h2>
      <p class="font-label text-[10px] tracking-widest text-ink-faint uppercase mt-0.5">
        Saved Spots · {{ totalCount }}
      </p>
    </header>

    <div v-if="totalCount === 0" class="px-2 py-10 text-center">
      <OsakaMotif kind="kuidaore" :size="48" color="#d9a04d" class="mx-auto mb-3" />
      <p class="font-body text-sm text-ink-soft">
        還沒收藏任何景點
      </p>
      <p class="font-label text-[10px] tracking-widest text-ink-faint uppercase mt-1.5">
        點景點卡上的
        <span class="material-symbols-outlined text-[14px] align-middle text-neon-pink">favorite</span>
        即可加入收藏
      </p>
    </div>

    <div v-else class="space-y-4">
      <template v-for="city in CITIES" :key="city.id">
        <div v-if="(grouped[city.id]?.length ?? 0) > 0">
          <div class="font-label text-[10px] tracking-widest text-ink-faint uppercase mb-1.5 px-0.5">
            {{ REGION_LABEL[city.id] }} · {{ grouped[city.id]!.length }}
          </div>
          <div class="space-y-2">
            <AttractionCard
              v-for="a in grouped[city.id]"
              :key="a.id"
              :attraction="a"
              :active="store.activeAttractionId === a.id"
              @click="store.selectAttraction(a.id)"
            />
          </div>
        </div>
      </template>
    </div>
  </section>
</template>
