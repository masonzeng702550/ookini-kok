<script setup lang="ts">
import { onMounted, watchEffect } from 'vue';
import TopAppBar from '@/components/layout/TopAppBar.vue';
import SideDrawer from '@/components/layout/SideDrawer.vue';
import PlanFab from '@/components/layout/PlanFab.vue';
import KansaiMap from '@/components/map/KansaiMap.vue';
import PrintItinerary from '@/components/panels/PrintItinerary.vue';
import { useMapStore } from '@/stores/map';
import { useBreakpoint } from '@/composables/useBreakpoint';
import { playKixChime } from '@/audio/chime';
import { applyShareHashOnLoad } from '@/utils/itinerary-share';
import type { CityId } from '@/types';

const store = useMapStore();
const { isMobile, isDesktop } = useBreakpoint();

applyShareHashOnLoad();

// Reflect the current theme as a class on <html> so the night-mode token
// overrides in tokens.css take effect across the whole UI.
watchEffect(() => {
  const root = document.documentElement;
  if (store.theme === 'night') root.classList.add('night');
  else root.classList.remove('night');
});

function selectCity(id: CityId) {
  store.selectCity(id);
  if (id === 'kix') playKixChime();
}

onMounted(() => {
  // Default: drawer closed on mobile, open on desktop.
  store.toggleDrawer(!isMobile.value);
});
</script>

<template>
  <div class="relative h-full overflow-hidden bg-paper">
    <TopAppBar @select-city="selectCity" @toggle-drawer="store.toggleDrawer()" />

    <!-- Map area -->
    <main
      class="absolute top-16 left-0 right-0 bottom-0 transition-[margin] duration-300"
      :style="
        isDesktop && store.drawerOpen ? 'margin-left: 20rem;' : 'margin-left: 0;'
      "
    >
      <KansaiMap />
    </main>

    <SideDrawer />
    <PlanFab />
    <PrintItinerary :itinerary="store.itinerary" />
  </div>
</template>
